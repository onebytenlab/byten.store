'use client';

import { useState } from 'react';
import { addToCartServerAction } from '../app/actions';

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

interface CheckoutCartProps {
  initialItems: CartItemNode[];
  initialTotal: string;
}

export default function CheckoutCart({ initialItems, initialTotal }: CheckoutCartProps) {
  const [items, setItems] = useState<CartItemNode[]>(initialItems);
  const [total, setTotal] = useState<string>(initialTotal);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function handleRemoveItem(productId: number, itemKey: string) {
    if (loadingKey) return;
    setLoadingKey(itemKey);

    const result = await addToCartServerAction(productId, 0);

    if (result.success) {
      const updatedItems = items.filter((item) => item.key !== itemKey);
      setItems(updatedItems);
      
      if (updatedItems.length === 0) {
        setTotal('0 ₸');
      } else {
        window.location.reload();
      }
    } else {
      alert(`Ошибка при удалении товара: ${result.error}`);
    }
    setLoadingKey(null);
  }

  return (
    <div style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #374151', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: '#f3f4f6', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>Ваш заказ</h2>
      
      {items.length === 0 ? (
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0' }}>Корзина пуста. Вернитесь в каталог и добавьте товар.</p>
      ) : (
        <div>
          {items.map((item) => {
            const dbId = item.product?.node?.databaseId || 0;
            const isDeleting = loadingKey === item.key;
            
            return (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.95rem', opacity: isDeleting ? 0.5 : 1 }}>
                <span style={{ color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleRemoveItem(dbId, item.key)}
                    disabled={isDeleting}
                    style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: isDeleting ? 'not-allowed' : 'pointer', fontWeight: 700, padding: '0 0.25rem', fontSize: '1.1rem' }}
                    title="Удалить из корзины"
                  >
                    ×
                  </button>
                  {item.product?.node?.name} <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>x{item.quantity}</span>
                </span>
                <span style={{ fontWeight: 700, color: '#22d3ee' }} dangerouslySetInnerHTML={{ __html: item.total }} />
              </div>
            );
          })}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #374151', paddingTop: '0.75rem', marginTop: '1rem', fontWeight: 800, fontSize: '1.1rem' }}>
            <span style={{ color: '#f3f4f6' }}>Итого к оплате:</span>
            <span style={{ color: '#22d3ee' }} dangerouslySetInnerHTML={{ __html: total }} />
          </div>
        </div>
      )}
    </div>
  );
}
