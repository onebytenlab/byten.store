export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { cache } from 'react';
import { getBlogPostBySlugAction } from '../../actions';
import BackButton from '../../../components/BackButton';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

const getCachedPostAndSettings = cache(async (slug: string) => {
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
          query GetPostAndGeneralSettings($id: ID!, $idType: PostIdType!) {
            post(id: $id, idType: $idType) {
              title
              content
              date
              featuredImage {
                node {
                  sourceUrl
                }
              }
            }
            generalSettings {
              title
            }
          }
        `,
        variables: { id: slug, idType: 'SLUG' }
      }),
      cache: 'no-store'
    });

    if (!res.ok) return { post: null, siteTitle: 'BYTEN.STORE' };
    const json = await res.json();
    
    let post = json?.data?.post || null;
    if (!post) {
      const fallbackRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
          'Host': 'api.byten.store'
        },
        body: JSON.stringify({
          query: `
            query GetPostFallback($id: ID!, $idType: PostIdType!) {
              post(id: $id, idType: $idType) {
                title
                content
                date
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
              }
            }
          `,
          variables: { id: slug.toLowerCase(), idType: 'SLUG' }
        }),
        cache: 'no-store'
      });
      const fallbackJson = await fallbackRes.json();
      post = fallbackJson?.data?.post || null;
    }

    return {
      post,
      siteTitle: json?.data?.generalSettings?.title || 'BYTEN.STORE'
    };
  } catch (e) {
    return { post: null, siteTitle: 'BYTEN.STORE' };
  }
});

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { post, siteTitle } = await getCachedPostAndSettings(resolvedParams.slug);

    if (post) {
      const pageTitle = post.title ? `${post.title} | ${siteTitle}` : `Статья | ${siteTitle}`;
      const cleanDesc = post.content 
        ? post.content.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 160).trim() + "..." 
        : `Читайте полезную статью в блоге игрового мира на ${siteTitle}.`;
      
      const imageUrl = post.featuredImage?.node?.sourceUrl || "";

      return {
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
          url: `https://byten.store{resolvedParams.slug}`,
          images: imageUrl ? [{ url: imageUrl }] : [],
        },
        twitter: {
          card: 'summary_large_image',
          title: pageTitle,
          description: cleanDesc,
          images: imageUrl ? [imageUrl] : [],
        }
      };
    }
  } catch (e) {}

  return {
    title: "Статья | BYTEN.STORE",
    description: "Читайте полезную статью в блоге игрового мира на BYTEN.STORE."
  };
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

export default async function BlogPostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const { post } = await getCachedPostAndSettings(resolvedParams.slug);

  if (!post) {
    return (
      <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '4rem 1rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Статья не найдена</h1>
        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Возможно, она была удалена или перенесена.</p>
        <BackButton />
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <BackButton />
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.75rem', color: '#f3f4f6', lineHeight: 1.2 }}>
            {post.title}
          </h1>
          <time style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500 }}>
            Опубликовано: {formatDate(post.date)}
          </time>
        </div>

        {post.featuredImage?.node?.sourceUrl && (
          <div style={{ width: '100%', maxHeight: '350px', overflow: 'hidden', borderRadius: '0.75rem', border: '1px solid #374151', marginBottom: '2rem' }}>
            <img src={post.featuredImage.node.sourceUrl} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div 
          className="blog-content"
          style={{ 
            color: '#d1d5db', 
            fontSize: '1.05rem', 
            lineHeight: 1.7, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem' 
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

      </div>
    </main>
  );
}
