'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  const [total, setTotal] = useState<string>(formatWooCommercePrice(initialTotal));
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  function formatWooCommercePrice(priceStr: string): string {
    try {
      const cleanHtml = priceStr.replace(/<\/?[^>]+(>|$)/g, "");
      const onlyDigits = cleanHtml.replace(/[^\d]/g, '');
      if (!onlyDigits) return '0 ₸';
      const parsedNum = parseInt(onlyDigits, 10);
      const mainValue = Math.floor(parsedNum / 100);
      return `${mainValue.toLocaleString('ru-RU')} ₸`;
    } catch (e) {
      return priceStr;
    }
  }

  async function handleRemoveItem(productId: number, itemKey: string) {
    if (loadingKey) return;
    setLoadingKey(itemKey);

    const result = await addToCartServerAction(productId, 0);

    if (result.success) {
      const updatedItems = items.filter((item) => item.key !== itemKey);
      setItems(updatedItems);
      window.dispatchEvent(new Event("byten_cart_update"));
      
      if (updatedItems.length === 0) {
        setTotal('0 ₸');
      } else {
        try {
          let currentTotalNum = 0;
          updatedItems.forEach(item => {
            const cleanHtml = item.total.replace(/<\/?[^>]+(>|$)/g, "");
            const onlyDigits = cleanHtml.replace(/[^\d]/g, '');
            const parsedNum = parseInt(onlyDigits, 10) || 0;
            currentTotalNum += Math.floor(parsedNum / 100);
          });
          setTotal(`${currentTotalNum.toLocaleString('ru-RU')} ₸`);
        } catch (e) {
          setTotal('0 ₸');
        }
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>Корзина пуста. Вернитесь в каталог и добавьте товар.</p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#22d3ee', color: '#111827', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#06b6d4'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22d3ee'}>
            В каталог товаров
          </Link>
        </div>
      ) : (
        <div>
          {items.map((item) => {
            const dbId = item.product?.node?.databaseId || 0;
            const isDeleting = loadingKey === item.key;
            
            return (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.95rem', opacity: isDeleting ? 0.5 : 1 }}>
                <span style={{ color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleRemoveItem(dbId, item.key)}
                    disabled={isDeleting}
                    style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: isDeleting ? 'not-allowed' : 'pointer', fontWeight: 900, padding: '0 0.5rem 0 0', fontSize: '2.2rem', lineHeight: '0.8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '2.5rem', minHeight: '2.5rem', transition: 'transform 0.1s, color 0.1s' }}
                    title="Удалить из корзины"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.2)';
                      e.currentTarget.style.color = '#f87171';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    ×
                  </button>
                  <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
                    <span>{item.product?.node?.name}</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.1rem' }}>Количество: {item.quantity} шт.</span>
                  </span>
                </span>
                <span style={{ fontWeight: 700, color: '#22d3ee' }} dangerouslySetInnerHTML={{ __html: formatWooCommercePrice(item.total) }} />
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
