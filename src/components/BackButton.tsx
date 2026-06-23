'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="back-button-clickable"
      style={{
        background: 'transparent',
        border: 'none',
        color: '#9ca3af',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1.1rem',
        cursor: 'pointer',
        padding: '0.25rem 0',
        transition: 'color 0.2s, transform 0.2s'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .back-button-clickable:hover {
          color: #22d3ee !important;
          transform: translateX(-2px);
        }
      `}} />
      <span style={{ fontSize: '1.5rem', lineHeight: '1', fontWeight: 900 }}>←</span> Назад
    </button>
  );
}
