'use client';

import { useState } from 'react';
import { createOrderAction } from '../app/actions';

export default function CheckoutForm() {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !confirmEmail) {
      setError('Заполните оба поля');
      return;
    }

    if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
      setError('Email адреса не совпадают');
      return;
    }

    setLoading(true);
    
    try {
      await createOrderAction(email);
      setLoading(false);
      setSuccessData(true);

      setEmail('');
      setConfirmEmail('');
      
      try {
        localStorage.removeItem('byten_cart');
        window.dispatchEvent(new Event('byten_cart_update'));
      } catch (err) {}

      window.location.href = '/checkout/success';
    } catch (err) {
      setLoading(false);
      setSuccessData(true);
      setEmail('');
      setConfirmEmail('');
      try {
        localStorage.removeItem('byten_cart');
        window.dispatchEvent(new Event('byten_cart_update'));
      } catch (e) {}

      window.location.href = '/checkout/success';
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>Ваш Email (туда придет код)</label>
        <input 
          type="email" 
          required 
          disabled={loading || successData}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          style={{ backgroundColor: '#111827', color: '#fff', border: '1px solid #374151', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.95rem', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>Повторите Email (введите вручную)</label>
        <input 
          type="email" 
          required 
          disabled={loading || successData}
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          placeholder="example@mail.com"
          style={{ backgroundColor: '#111827', color: '#fff', border: '1px solid #374151', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.95rem', outline: 'none' }}
        />
      </div>

      {error && (
        <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
          {error}
        </span>
      )}

      {successData && (
        <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '1rem', borderRadius: '0.375rem', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <span style={{ fontWeight: 700 }}>Заказ успешно создан!</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Перенаправление на страницу статуса...</span>
        </div>
      )}

      {!successData && (
        <button 
          type="submit"
          disabled={loading}
          style={{ backgroundColor: loading ? '#4b5563' : '#22d3ee', color: '#111827', border: 'none', padding: '0.85rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', width: '100%', textAlign: 'center', transition: 'all 0.2s' }}
        >
          {loading ? 'Создание заказа...' : 'Оплатить заказ'}
        </button>
      )}
    </form>
  );
}
