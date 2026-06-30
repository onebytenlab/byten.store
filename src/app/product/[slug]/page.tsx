export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { cache } from 'react';
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

const getCachedProductAndSettings = cache(async (slug: string) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    const cleanSlug = slug.replace(/\//g, '').trim();
    
    const tryFetch = async (idValue: string, idType: string) => {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
          'Host': 'api.byten.store'
        },
        body: JSON.stringify({
          query: `
            query GetProductAndGeneralSettings($id: ID!, $idType: ProductIdType!) {
              product(id: $id, idType: $idType) {
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
              generalSettings {
                title
              }
            }
          `,
          variables: { id: idValue, idType }
        }),
        cache: 'no-store'
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    };

    let data = await tryFetch(cleanSlug, 'SLUG');
    
    if (!data?.product) {
      data = await tryFetch(cleanSlug.toLowerCase(), 'SLUG');
    }
    
    if (!data?.product) {
      const listRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
          'Host': 'api.byten.store'
        },
        body: JSON.stringify({
          query: `
            query FindProductBySlugList {
              products(first: 50) {
                nodes {
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
              generalSettings {
                title
              }
            }
          `
        }),
        cache: 'no-store'
      });
      const listJson = await listRes.json();
      const allProducts = listJson?.data?.products?.nodes || [];
      const matchedProduct = allProducts.find((p: any) => p.slug.toLowerCase() === cleanSlug.toLowerCase());
      
      if (matchedProduct) {
        if (matchedProduct.image?.sourceUrl && matchedProduct.image.sourceUrl.includes('api.byten.store')) {
          matchedProduct.image.sourceUrl = matchedProduct.image.sourceUrl.replace('api.byten.store', 'byten.store');
        }
        return {
          product: matchedProduct,
          siteTitle: listJson?.data?.generalSettings?.title || 'BYTEN.STORE'
        };
      }
    }

    if (data?.product?.image?.sourceUrl && data.product.image.sourceUrl.includes('api.byten.store')) {
      data.product.image.sourceUrl = data.product.image.sourceUrl.replace('api.byten.store', 'byten.store');
    }

    return {
      product: data?.product || null,
      siteTitle: data?.generalSettings?.title || 'BYTEN.STORE'
    };
  } catch (e) {
    return { product: null, siteTitle: 'BYTEN.STORE' };
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  let fallbackSlug = "";
  try {
    const resolvedParams = await params;
    fallbackSlug = resolvedParams.slug;
    const { product, siteTitle } = await getCachedProductAndSettings(fallbackSlug);

    const pageTitle = product?.name ? product.name + " | " + siteTitle : "Купить товар | " + siteTitle;
    let cleanDesc = product?.description 
      ? product.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160).trim() + "..." 
      : "Купить цифровой товар в магазине цифровых кодов " + siteTitle + ". Автовыдача сразу после оплаты.";
    
    cleanDesc = cleanDesc
      .replace(/–/g, '–')
      .replace(/&#8211;/g, '–')
      .replace(/&amp;#8211;/g, '–');

    let imageUrl = product?.image?.sourceUrl || "";

    const activeSlug = product?.slug || fallbackSlug;

    return {
      metadataBase: new URL('https://byten.store'),
      title: pageTitle,
      description: cleanDesc,
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: pageTitle,
        description: cleanDesc,
        type: 'article',
        url: '/product/' + activeSlug,
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: cleanDesc,
        images: imageUrl ? [imageUrl] : [],
      }
    };
  } catch (e) {}

  return {
    metadataBase: new URL('https://byten.store'),
    title: "Купить цифровой товар | BYTEN.ONLINE",
    description: "Цифровые коды пополнения и доступы. Автовыдача сразу после оплаты.",
    openGraph: {
      url: '/product/' + fallbackSlug,
    }
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const { product } = await getCachedProductAndSettings(resolvedParams.slug);

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
