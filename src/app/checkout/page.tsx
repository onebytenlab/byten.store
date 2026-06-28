export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import Link from 'next/link';
import CheckoutForm from '../../components/CheckoutForm';
import CheckoutCart from '../../components/CheckoutCart';
import BackButton from '../../components/BackButton';
import { getCartAction } from '../actions';

interface CartItemNode {
  key: string;
  quantity: number;
  total: string;
  product?: {
    node: {
      id: string;
      databaseId: number;
      name: string;
    };
  };
}

interface CartData {
  total: string;
  subtotal: string;
  contents?: {
    nodes: CartItemNode[];
  };
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const cart: CartData | null = await getCartAction();
  const cartItems = cart?.contents?.nodes || [];
  const cartTotal = cart?.total || '0 ₸';

  return (
    <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '32rem', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <BackButton />
        </div>

        <CheckoutCart initialItems={cartItems} initialTotal={cartTotal} />

        <div style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #374151' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#f3f4f6' }}>Контактные данные</h2>
          <CheckoutForm />
        </div>

      </div>
    </main>
  );
}
