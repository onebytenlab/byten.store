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
    
    console.log("=== BYTEN BACKEND RAW RESPONSE ===");
    console.log(text);
    console.log("==================================");

    if (!text) return { success: false, error: 'Empty checkout response' };
    
    let json: any;
    try {
      json = JSON.parse(text);
    } catch (parseError) {
      return { success: false, error: 'Response parsing error' };
    }
    
    if (json.errors) {
      return { success: false, error: Array.isArray(json.errors) ? json.errors[0]?.message || 'Order Error' : 'Order Error' };
    }

    const orderId = json?.data?.checkout?.order?.databaseId || Date.now();
    const orderKey = json?.data?.checkout?.order?.orderKey || '';

    try {
      cookieStore.delete('woocommerce-session');
    } catch (cookieError) {}

    return { 
      success: true, 
      orderId: orderId,
      orderKey: orderKey
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
