import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '80vh', padding: '2rem', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '28rem', width: '100%', backgroundColor: '#1f2937', padding: '2.5rem', borderRadius: '0.75rem', border: '1px solid #374151', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
        
        <div style={{ width: '4rem', height: '4rem', backgroundColor: '#10b981', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
          <svg 
            xmlns="http://w3.org" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={3} 
            stroke="currentColor" 
            style={{ width: '2rem', height: '2rem', color: '#fff' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: '0 0 0.5rem 0' }}>Заказ создан</h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', margin: '0 0 2rem 0', lineHeight: '1.5' }}>
          Ваш товар будет отправлен на Email сразу после подтверждения транзакции платежной системой.
        </p>

        <Link 
          href="/" 
          style={{ display: 'block', width: '100%', backgroundColor: '#22d3ee', color: '#111827', padding: '0.85rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}
        >
          Вернуться в каталог
        </Link>

      </div>
    </main>
  );
}
