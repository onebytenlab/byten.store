'use server';

import { cookies } from 'next/headers';

export async function addToCartServerAction(productId: number, quantity: number = 1) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    const cookieStore = await cookies();
    const existingSession = cookieStore.get('woocommerce-session')?.value || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
      'Host': 'api.byten.store'
    };

    if (existingSession) {
      headers['woocommerce-session'] = `Session ${existingSession}`;
    }

    const cartRes = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query: `query GetCartKeys { cart { contents { nodes { key quantity product { node { databaseId } } } } } }`
      }),
      cache: 'no-store'
    });
    
    if (!cartRes.ok) return { success: false, error: 'Network error' };
    const cartText = await cartRes.text();
    if (!cartText) return { success: false, error: 'Empty network response' };
    const cartJson = JSON.parse(cartText);
    const targetItem = cartJson?.data?.cart?.contents?.nodes?.find((node: any) => node.product?.node?.databaseId === productId);

    let query = '';
    let variables: any = {};

    if (quantity === 0) {
      if (!targetItem?.key) return { success: true };
      query = `mutation RemoveFromCart($input: RemoveItemsFromCartInput!) {
        removeItemsFromCart(input: $input) {
          cart { total }
        }
      }`;
      variables = { input: { keys: [targetItem.key], all: false } };
    } else if (targetItem?.key) {
      query = `mutation UpdateCartQty($input: UpdateItemQuantitiesInput!) {
        updateItemQuantities(input: $input) {
          items { key quantity }
        }
      }`;
      variables = { input: { items: [{ key: targetItem.key, quantity: quantity }] } };
    } else {
      query = `mutation AddToCart($input: AddToCartInput!) {
        addToCart(input: $input) {
          cartItem { key quantity }
        }
      }`;
      variables = { input: { productId: productId, quantity: quantity } };
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query, variables }),
      cache: 'no-store'
    });

    let sessionHeader = res.headers.get('woocommerce-session');
    if (!sessionHeader) {
      for (const [key, value] of res.headers.entries()) {
        if (key.toLowerCase() === 'woocommerce-session') {
          sessionHeader = value;
          break;
        }
      }
    }

    if (sessionHeader) {
      const cleanSession = sessionHeader.replace('Session ', '');
      cookieStore.set('woocommerce-session', cleanSession, { path: '/', httpOnly: false, secure: false, maxAge: 60 * 60 * 24 * 30 });
    }

    if (!res.ok) return { success: false, error: 'Network error execution' };
    const text = await res.text();
    if (!text) return { success: true };
    const json = JSON.parse(text);
    if (json.errors) return { success: false, error: Array.isArray(json.errors) ? json.errors?.message : 'Error' };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getCartAction() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    const cookieStore = await cookies();
    const currentSession = cookieStore.get('woocommerce-session')?.value || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
      'Host': 'api.byten.store'
    };

    if (currentSession) {
      headers['woocommerce-session'] = `Session ${currentSession}`;
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        query: `
          query GetCart {
            cart {
              total
              subtotal
              contents {
                nodes {
                  key
                  quantity
                  total
                  product {
                    node {
                      id
                      databaseId
                      name
                    }
                  }
                }
              }
            }
          }
        `
      }),
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    const json = JSON.parse(text);
    return json?.data?.cart || null;
  } catch (e) {
    return null;
  }
}

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
