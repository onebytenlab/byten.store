'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToCartServerAction } from '../app/actions';

interface ProductActionProps {
  productId: string | number;
  productName: string;
  price: string;
  isInitiallyInCart: boolean;
}

export default function ProductAction({ productId, productName, price, isInitiallyInCart }: ProductActionProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'added'>(isInitiallyInCart ? 'added' : 'idle');
  const [quantity, setQuantity] = useState<number>(1);

  async function handleAddToCartButtonClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (status === 'added') {
      router.push('/checkout');
      return;
    }

    if (status === 'loading') return;
    setStatus('loading');

    const cleanId = typeof productId === 'string' ? parseInt(productId) || 0 : productId;
    const result = await addToCartServerAction(cleanId, quantity);

    if (result.success) {
      setStatus('added');
    } else {
      alert(`Ошибка: ${result.error}`);
      setStatus('idle');
    }
  }

  async function updateQuantity(newQty: number) {
    if (status === 'loading') return;
    
    if (newQty === 0) {
      setStatus('loading');
      const cleanId = typeof productId === 'string' ? parseInt(productId) || 0 : productId;
      const result = await addToCartServerAction(cleanId, 0);
      
      if (result.success) {
        setQuantity(1);
        setStatus('idle');
      } else {
        alert(`Ошибка при удалении: ${result.error}`);
        setStatus('added');
      }
      return;
    }

    setQuantity(newQty);

    if (status === 'added') {
      setStatus('loading');
      const cleanId = typeof productId === 'string' ? parseInt(productId) || 0 : productId;
      const result = await addToCartServerAction(cleanId, newQty);
      if (result.success) {
        setStatus('added');
      } else {
        alert(`Ошибка обновления количества: ${result.error}`);
        setStatus('added');
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#1f2937', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #374151', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>Цена товара:</span>
        <span 
          style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22d3ee', whiteSpace: 'nowrap' }}
          dangerouslySetInnerHTML={{ __html: price || '0 ₸' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #374151', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
        <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>Количество:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#111827', padding: '0.25rem', borderRadius: '0.375rem', border: '1px solid #374151' }}>
          <button 
            onClick={() => updateQuantity(status === 'added' ? quantity - 1 : Math.max(1, quantity - 1))}
            disabled={status === 'loading'}
            style={{ backgroundColor: 'transparent', color: '#9ca3af', border: 'none', width: '2rem', height: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}
          >
            -
          </button>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', minWidth: '1.5rem', textAlign: 'center' }}>
            {quantity}
          </span>
          <button 
            onClick={() => updateQuantity(quantity + 1)}
            disabled={status === 'loading'}
            style={{ backgroundColor: 'transparent', color: '#9ca3af', border: 'none', width: '2rem', height: '2rem', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}
          >
            +
          </button>
        </div>
      </div>

      <button 
        onClick={handleAddToCartButtonClick}
        disabled={status === 'loading'}
        style={{ 
          backgroundColor: status === 'added' ? '#10b981' : '#22d3ee', 
          color: status === 'added' ? '#fff' : '#111827', 
          border: 'none', 
          padding: '0.75rem', 
          borderRadius: '0.375rem', 
          fontWeight: 700, 
          fontSize: '0.95rem', 
          cursor: status === 'loading' ? 'not-allowed' : 'pointer', 
          width: '100%', 
          textAlign: 'center', 
          transition: 'all 0.2s',
          marginTop: '0.5rem'
        }}
      >
        {status === 'idle' && 'Добавить в корзину'}
        {status === 'loading' && 'Синхронизация...'}
        {status === 'added' && 'Перейти к оплате →'}
      </button>
    </div>
  );
}
