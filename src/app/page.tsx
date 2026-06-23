export const dynamic = 'force-dynamic';

import CategoryMenu from '../components/CategoryMenu';
import CatalogGrid from '../components/CatalogGrid';
import { getCartAction } from './actions';

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

async function getProducts() {
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
          query GetProducts {
            products(first: 50) {
              nodes {
                id
                databaseId
                name
                slug
                image {
                  sourceUrl
                }
                productCategories {
                  nodes {
                    slug
                  }
                }
                ... on SimpleProduct {
                  price
                }
              }
            }
          }
        `,
      }),
      cache: 'no-store'
    });
    const json = await res.json();
    return json?.data?.products?.nodes || [];
  } catch (error) {
    return [];
  }
}

export default async function HomePage(props: {
  searchParams: Promise<{ category?: string }>;
}) {
  const products = await getProducts();
  const resolvedSearchParams = await props.searchParams;
  const activeCategory = resolvedSearchParams?.category || 'all';

  const cart = await getCartAction();
  const cartProductIds: number[] = cart?.contents?.nodes?.map((item: any) => item.product?.node?.databaseId || item.product?.node?.productId).filter(Boolean) || [];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((product: Product) => 
        product.productCategories?.nodes?.some((cat) => cat.slug === activeCategory)
      );

  return (
    <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#22d3ee', margin: 0 }}>BYTEN.STORE</h1>
          <p style={{ color: '#9ca3af', marginTop: '0.25rem', fontSize: '0.875rem' }}>Магазин цифровых кодов и доступов</p>
        </header>

        <CategoryMenu activeCategory={activeCategory} />

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Каталог товаров</h2>
          <CatalogGrid products={filteredProducts} cartProductIds={cartProductIds} />
        </section>
      </div>
    </main>
  );
}
