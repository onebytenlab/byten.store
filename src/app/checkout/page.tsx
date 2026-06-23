import Link from 'next/link';
import CheckoutForm from '../../components/CheckoutForm';
import CheckoutCart from '../../components/CheckoutCart';
import { getCartAction } from '../actions';

export const dynamic = 'force-dynamic';

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

export default async function CheckoutPage() {
  const cart: CartData | null = await getCartAction();
  const cartItems = cart?.contents?.nodes || [];
  const cartTotal = cart?.total || '0 ₸';

  return (
    <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '2rem', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22d3ee', margin: 0 }}>BYTEN.STORE</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.85rem' }}>Оформление заказа</p>
        </header>

        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
            ← Вернуться в каталог
          </Link>
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
