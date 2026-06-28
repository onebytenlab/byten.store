'use server';

import { cookies } from 'next/headers';

export async function createOrderAction(email: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    const cookieStore = await cookies();
    let currentSession = cookieStore.get('woocommerce-session')?.value || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
      'Host': 'api.byten.store'
    };

    if (currentSession) {
      headers['woocommerce-session'] = `Session ${currentSession}`;
    }

    const res = await fetch(`${apiUrl}?ts=${Date.now()}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query: `
          mutation CreateOrder($input: CheckoutInput!) {
            checkout(input: $input) {
              order {
                databaseId
                orderKey
                total
              }
              result
              redirect
            }
          }
        `,
        variables: {
          input: {
            clientMutationId: `byten-id-${Date.now()}`,
            billing: {
              firstName: "Buyer",
              lastName: "Digital",
              address1: "Online",
              city: "Online",
              country: "KZ",
              email: email,
              phone: "77777777777"
            },
            shipping: {
              firstName: "Buyer",
              lastName: "Digital",
              address1: "Online",
              city: "Online",
              country: "KZ"
            },
            isPaid: false,
            paymentMethod: "cheque",
            shipToDifferentAddress: false
          }
        }
      }),
      cache: 'no-store'
    });

    if (!res.ok) return { success: false, error: 'Network error checkout' };
    const text = await res.text();

    if (!text) return { success: false, error: 'Empty checkout response' };
    
    let json: any;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      return { success: false, error: 'Response parsing error' };
    }
    
    if (json.errors) {
      return { success: false, error: Array.isArray(json.errors) ? json.errors?.message || 'Order Error' : 'Order Error' };
    }

    const orderData = json?.data?.checkout?.order;
    if (!orderData) return { success: false, error: 'Order not created' };

    const orderId = orderData.databaseId;
    const orderKey = orderData.orderKey;
    const rawTotal = orderData.total || '';
    
    const cleanDigits = rawTotal.replace(/<\/?[^>]+(>|$)/g, "").replace(/[^\d]/g, '');
    const totalAmount = Math.floor((parseInt(cleanDigits, 10) || 0) / 100) || 100;

    const mockShopId = '123456';
    const mockSecretKey = 'test_secret_key_abcdef';
    const authHeader = 'Basic ' + Buffer.from(`${mockShopId}:${mockSecretKey}`).toString('base64');

    let confirmationUrl = `https://yoomoney.ru{orderId}`;

    try {
      const yookassaRes = await fetch('https://yookassa.ru', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Idempotence-Key': `idemp-${orderId}-${Date.now()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: {
            value: totalAmount.toFixed(2),
            currency: 'RUB'
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: 'http://byten.store/checkout/success'
          },
          description: `Заказ #${orderId} на byten.store`,
          metadata: {
            order_id: orderId.toString(),
            order_key: orderKey,
            email: email
          }
        }),
        cache: 'no-store'
      });

      if (yookassaRes.ok) {
        const yookassaJson = await yookassaRes.json();
        if (yookassaJson?.confirmation?.confirmation_url) {
          confirmationUrl = yookassaJson.confirmation.confirmation_url;
        }
      }
    } catch (e) {}

    try {
      cookieStore.delete('woocommerce-session');
    } catch (cookieError) {}

    return { 
      success: true, 
      orderId: orderId,
      orderKey: orderKey,
      paymentUrl: confirmationUrl
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
