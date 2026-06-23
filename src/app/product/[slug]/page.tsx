export const dynamic = 'force-dynamic';

import Link from 'next/link';
import ProductAction from '../../../components/ProductAction';
import BackButton from '../../../components/BackButton';
import { getCartAction } from '../../actions';

interface ProductData {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  image?: {
    sourceUrl: string;
  };
  price?: string;
}

async function getProductBySlug(slug: string): Promise<ProductData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
        'Host': 'api.byten.store'
      },
      body: JSON.stringify({
        query: `
          query GetProductBySlug($id: ID!) {
            product(id: $id, idType: SLUG) {
              id
              databaseId
              name
              slug
              description
              image {
                sourceUrl
              }
              ... on SimpleProduct {
                price
              }
            }
          }
        `,
        variables: { id: slug }
      }),
      cache: 'no-store'
    });

    const json = await res.json();
    return json?.data?.product || null;
  } catch (error) {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    return (
      <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>Товар не найден</h1>
        <Link href="/" style={{ color: '#22d3ee', marginTop: '1rem', textDecoration: 'none', fontWeight: 700 }}>
          Вернуться на главную
        </Link>
      </main>
    );
  }

  const cart = await getCartAction();
  const cartProductIds: number[] = cart?.contents?.nodes?.map((item: any) => item.product?.node?.databaseId || item.product?.node?.productId).filter(Boolean) || [];
  const isProductInCart = cartProductIds.includes(product.databaseId);

  return (
    <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .product-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        @media (min-width: 640px) {
          .product-layout {
            grid-template-columns: 4fr 6fr;
            gap: 2.5rem;
          }
        }
      `}} />

      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>

        <div style={{ marginBottom: '1rem' }}>
          <BackButton />
        </div>

        <div className="product-layout">
          
          <div style={{ width: '100%', aspectRatio: '16 / 10', backgroundColor: '#1f2937', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {product.image?.sourceUrl ? (
              <img src={product.image.sourceUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ color: '#4b5563', fontSize: '0.85rem', fontWeight: 600 }}>Нет фото</div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f3f4f6', marginBottom: '1rem', lineHeight: '1.3' }}>
              {product.name}
            </h1>

            <ProductAction 
              productId={product.databaseId} 
              productName={product.name} 
              price={product.price || '0 ₸'} 
              isInitiallyInCart={isProductInCart}
            />

            {product.description && (
              <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#22d3ee' }}>Описание товара</h2>
                <div 
                  style={{ color: '#9ca3af', lineHeight: '1.5', fontSize: '0.9rem' }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
