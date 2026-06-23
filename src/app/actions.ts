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
    const cartJson = await cartRes.json();
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
      cookieStore.set('woocommerce-session', cleanSession, { path: '/', httpOnly: false, secure: false });
    }

    const json = await res.json();
    if (json.errors) return { success: false, error: json.errors?.message || 'Error' };
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

    const json = await res.json();
    return json?.data?.cart || null;
  } catch (e) {
    return null;
  }
}

export async function createOrderAction(email: string) {
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
            clientMutationId: "byten-mutation-id",
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
            paymentMethod: "cod",
            shipToDifferentAddress: false
          }
        }
      }),
      cache: 'no-store'
    });

    const json = await res.json();
    if (json.errors) return { success: false, error: json.errors?.message || 'Order Error' };
    return { 
      success: true, 
      orderId: json?.data?.checkout?.order?.databaseId,
      orderKey: json?.data?.checkout?.order?.orderKey
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
