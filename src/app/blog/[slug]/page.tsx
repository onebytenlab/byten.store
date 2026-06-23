import { getBlogPostBySlugAction } from '../../actions';
import BackButton from '../../../components/BackButton';

export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: Promise<{ slug: string }>;
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
  const post = await getBlogPostBySlugAction(resolvedParams.slug);

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
