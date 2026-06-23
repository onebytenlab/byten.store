'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addToCartServerAction } from '../app/actions';

interface Category {
  slug: string;
}

interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image?: {
    sourceUrl: string;
  };
  productCategories?: {
    nodes: Category[];
  };
  price?: string;
}

interface ProductCardProps {
  product: Product;
  isInitiallyInCart: boolean;
}

export default function ProductCard({ product, isInitiallyInCart }: ProductCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'added'>(isInitiallyInCart ? 'added' : 'idle');

  const categorySlug = product.productCategories?.nodes?.[0]?.slug || 'code';
  const categoryName = categorySlug.toUpperCase();

  async function handleBuyButtonClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status === 'added') {
      router.push('/checkout');
      return;
    }

    if (status === 'loading') return;
    setStatus('loading');

    const result = await addToCartServerAction(product.databaseId);

    if (result.success) {
      setStatus('added');
    } else {
      alert(`Ошибка: ${result.error}`);
      setStatus('idle');
    }
  }

  return (
    <div 
      className="product-card-container"
      style={{ 
        backgroundColor: '#1f2937', 
        padding: '1rem', 
        borderRadius: '0.75rem', 
        border: '1px solid #374151', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '340px',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .product-card-container:hover {
          transform: translateY(-4px);
          border-color: #22d3ee;
          box-shadow: 0 10px 15px -3px rgba(34, 211, 238, 0.1), 0 4px 6px -2px rgba(34, 211, 238, 0.05);
        }
      `}} />

      <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ 
          width: '100%', 
          aspectRatio: '16 / 10',
          backgroundColor: '#111827', 
          borderRadius: '0.5rem', 
          overflow: 'hidden', 
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #1f2937'
        }}>
          {product.image?.sourceUrl ? (
            <img 
              src={product.image.sourceUrl} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ color: '#4b5563', fontSize: '0.75rem', fontWeight: 600 }}>Нет фото</div>
          )}
        </div>

        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22d3ee', letterSpacing: '0.05em', marginBottom: '0.25rem', textAlign: 'center', display: 'inline-block' }}>
          {categoryName}
        </span>

        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '0.75rem', lineHeight: '1.4', textAlign: 'center', padding: '0 0.25rem' }}>
          {product.name}
        </h3>
      </Link>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #374151', paddingTop: '0.75rem', marginTop: 'auto' }}>
        <span 
          style={{ fontSize: '1.25rem', fontWeight: 900, color: '#22d3ee', whiteSpace: 'nowrap', textAlign: 'center' }}
          dangerouslySetInnerHTML={{ __html: product.price || '0 ₸' }}
        />
        <button 
          onClick={handleBuyButtonClick}
          disabled={status === 'loading'}
          style={{ 
            backgroundColor: status === 'added' ? '#10b981' : '#22d3ee', 
            color: status === 'added' ? '#fff' : '#111827', 
            border: 'none', 
            padding: '0.6rem 1.2rem', 
            borderRadius: '0.5rem', 
            fontWeight: 700, 
            fontSize: '0.85rem', 
            cursor: status === 'loading' ? 'not-allowed' : 'pointer', 
            width: '100%', 
            textAlign: 'center', 
            transition: 'background-color 0.2s' 
          }}
        >
          {status === 'idle' && 'Добавить в корзину'}
          {status === 'loading' && 'Добавление...'}
          {status === 'added' && 'Перейти к оплате →'}
        </button>
      </div>
    </div>
  );
}
