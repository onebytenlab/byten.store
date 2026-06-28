export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { getBlogPostsAction } from '../actions';
import BackButton from '../../components/BackButton';

interface BlogPostNode {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    const baseApiUrl = apiUrl.replace('/graphql', '');
    
    const restUrl = `${baseApiUrl}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(baseApiUrl + '/blog')}`;
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

        const pageTitle = (titleMatch && titleMatch[1]) ? titleMatch[1].trim() : "Блог игрового мира | BYTEN.STORE";
        const pageDesc = (descMatch && descMatch[1]) ? descMatch[1].trim() : "Полезные статьи, игровые гайды и инструкции по активации ключей на BYTEN.STORE.";
        const robotsStr = (robotsMatch && robotsMatch[1]) ? robotsMatch[1].toLowerCase() : "";

        return {
          title: pageTitle,
          description: pageDesc,
          robots: {
            index: !robotsStr.includes('noindex'),
            follow: !robotsStr.includes('nofollow'),
          },
          openGraph: {
            title: (ogTitleMatch && ogTitleMatch[1]) ? ogTitleMatch[1].trim() : pageTitle,
            description: (ogDescMatch && ogDescMatch[1]) ? ogDescMatch[1].trim() : pageDesc,
            type: 'website',
            url: 'https://byten.store',
          },
          twitter: {
            card: 'summary_large_image',
            title: (ogTitleMatch && ogTitleMatch[1]) ? ogTitleMatch[1].trim() : pageTitle,
            description: (ogDescMatch && ogDescMatch[1]) ? ogDescMatch[1].trim() : pageDesc,
          }
        };
      }
    }
  } catch (e) {}

  return {
    title: "Блог игрового мира | BYTEN.STORE",
    description: "Полезные статьи, игровые гайды и инструкции по активации ключей на BYTEN.STORE."
  };
}

function cleanHtmlTags(htmlStr: string): string {
  if (!htmlStr) return '';
  return htmlStr.replace(/<\/?[^>]+(>|$)/g, '');
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

export default async function BlogPage() {
  const posts: BlogPostNode[] = await getBlogPostsAction();

  return (
    <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <BackButton />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.5rem', color: '#f3f4f6' }}>
            Блог
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0 }}>
            Полезные статьи, гайды по активации и новости игрового мира
          </p>
        </div>

        {(!posts || posts.length === 0) ? (
          <div style={{ backgroundColor: '#1f2937', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #374151', textAlign: 'center', color: '#9ca3af' }}>
            Записи в блоге пока не опубликованы.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.map((post) => (
              <article key={post.id} style={{ backgroundColor: '#1f2937', borderRadius: '0.75rem', border: '1px solid #374151', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {post.featuredImage?.node?.sourceUrl && (
                  <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative', borderBottom: '1px solid #374151' }}>
                    <img src={post.featuredImage.node.sourceUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '1.5rem' }}>
                  <time style={{ fontSize: '0.8rem', color: '#22d3ee', fontWeight: 500 }}>
                    {formatDate(post.date)}
                  </time>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.35rem', marginBottom: '0.75rem', color: '#f3f4f6', lineHeight: 1.3 }}>
                    {post.title}
                  </h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                    {cleanHtmlTags(post.excerpt)}
                  </p>
                  <a href={`/blog/${post.slug}`} style={{ display: 'inline-flex', backgroundColor: '#22d3ee', color: '#111827', fontWeight: 700, padding: '0.6rem 1.2rem', borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.875rem', transition: 'opacity 0.2s' }}>
                    Читать далее
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
