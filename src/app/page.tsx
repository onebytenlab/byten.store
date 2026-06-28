export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import CategoryMenu from '../components/CategoryMenu';
import CatalogGrid from '../components/CatalogGrid';
import { getCartAction, getFrontendFeaturesAction } from './actions';

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

interface FrontendFeature {
  icon: string;
  title: string;
  description: string;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    const baseApiUrl = apiUrl.replace('/graphql', '');
    
    const restUrl = `${baseApiUrl}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(baseApiUrl + '/')}`;
    const restRes = await fetch(restUrl, { cache: 'no-store' });
    
    if (restRes.ok) {
      const restJson = await restRes.json();
      if (restJson?.head) {
        const headHtml = restJson.head;
        
        const titleMatch = headHtml.match(/<title>([\s\S]*?)<\/title>/i);
        const descMatch = headHtml.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i);
        const robotsMatch = headHtml.match(/<meta\s+name=["']robots["']\s+content=["']([\s\S]*?)["']/i);
        const ogTitleMatch = headHtml.match(/<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i);
        const ogDescMatch = headHtml.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i);

        const pageTitle = titleMatch ? titleMatch[1].trim() : "BYTEN.STORE | Магазин цифровых кодов";
        const pageDesc = descMatch ? descMatch[1].trim() : "Купить цифровые коды пополнения и доступы для Steam, PlayStation, Xbox. Автовыдача сразу после оплаты.";
        const robotsStr = robotsMatch ? robotsMatch[1].toLowerCase() : "";

        return {
          title: pageTitle,
          description: pageDesc,
          robots: {
            index: !robotsStr.includes('noindex'),
            follow: !robotsStr.includes('nofollow'),
          },
          openGraph: {
            title: ogTitleMatch ? ogTitleMatch[1].trim() : pageTitle,
            description: ogDescMatch ? ogDescMatch[1].trim() : pageDesc,
            type: 'website',
            url: 'https://byten.store',
          },
          twitter: {
            card: 'summary_large_image',
            title: ogTitleMatch ? ogTitleMatch[1].trim() : pageTitle,
            description: ogDescMatch ? ogDescMatch[1].trim() : pageDesc,
          }
        };
      }
    }
  } catch (e) {}

  return {
    title: "BYTEN.STORE | Магазин цифровых кодов",
    description: "Купить цифровые коды пополнения и доступы для Steam, PlayStation, Xbox. Автовыдача сразу после оплаты."
  };
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
  const features = await getFrontendFeaturesAction();
  const resolvedSearchParams = await props.searchParams;
  const activeCategory = resolvedSearchParams?.category || 'all';

  const cart = await getCartAction();
  const cartProductIds: number[] = cart?.contents?.nodes?.map((item: any) => item.product?.node?.databaseId || item.product?.node?.productId).filter(Boolean) || [];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((product: Product) => 
        product.productCategories?.nodes?.some((cat) => cat.slug === activeCategory)
      );

  const displayFeatures = features && features.length > 0 ? features : [
    { icon: '⚡', title: 'Автовыдача', description: 'Код приходит на email сразу после оплаты' },
    { icon: '🛡️', title: '100% Безопасность', description: 'Лицензионные ключи и официальные пополнения' },
    { icon: '🤝', title: 'Поддержка', description: 'Поможем со всеми вопросами активации' }
  ];

  return (
    <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {displayFeatures.map((feat: FrontendFeature, idx: number) => (
            <div key={idx} style={{ backgroundColor: '#1f2937', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: '#22d3ee', fontSize: '1.5rem', fontWeight: 900 }}>{feat.icon}</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6' }}>{feat.title}</h4>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>{feat.description}</p>
              </div>
            </div>
          ))}
        </div>

        <CategoryMenu activeCategory={activeCategory} />

        <section style={{ backgroundColor: '#1f2937', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #374151', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', marginTop: 0, color: '#f3f4f6' }}>Каталог товаров</h2>
          <CatalogGrid products={filteredProducts} cartProductIds={cartProductIds} />
        </section>

      </div>
    </main>
  );
}
