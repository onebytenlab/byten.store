'use server';

export async function getGeneralSettingsAction() {
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
          query GetGeneralSettings {
            generalSettings {
              title
              description
            }
          }
        `
      }),
      cache: 'no-store'
    });

    if (!res.ok) return { title: 'BYTEN.STORE', description: '' };
    const json = await res.json();
    return json?.data?.generalSettings || { title: 'BYTEN.STORE', description: '' };
  } catch (e) {
    return { title: 'BYTEN.STORE', description: '' };
  }
}

export async function getHeaderMenuAction() {
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
          query GetHeaderMenu {
            bytenSettings {
              headerMenu {
                label
                url
              }
            }
          }
        `
      }),
      cache: 'no-store'
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.bytenSettings?.headerMenu || [];
  } catch (e) {
    return [];
  }
}

export async function getFrontendFeaturesAction() {
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
          query GetFrontendFeatures {
            bytenSettings {
              features {
                icon
                title
                description
              }
            }
          }
        `
      }),
      cache: 'no-store'
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.bytenSettings?.features || [];
  } catch (e) {
    return [];
  }
}

export async function getBlogPostsAction() {
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
          query GetBlogPosts {
            posts(first: 10) {
              nodes {
                id
                title
                slug
                date
                excerpt
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
              }
            }
          }
        `
      }),
      cache: 'no-store'
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.posts?.nodes || [];
  } catch (e) {
    return [];
  }
}

export async function getBlogPostBySlugAction(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    
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
            query GetBlogPostBySlug($id: ID!, $idType: PostIdType!) {
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
          variables: { id: idValue, idType }
        }),
        cache: 'no-store'
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data?.post || null;
    };

    let post = await tryFetch(slug, 'SLUG');
    if (!post) post = await tryFetch(`/${slug}`, 'URI');
    if (!post) post = await tryFetch(`/blog/${slug}`, 'URI');
    
    return post;
  } catch (e) {
    return null;
  }
}

export async function getPageSeoAction(uri: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
    const targetUri = uri === '/' ? 'frontpage' : uri;
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
        'Host': 'api.byten.store'
      },
      body: JSON.stringify({
        query: `
          query GetPageSeo($uri: ID!) {
            nodeByUri(uri: $uri) {
              ... on Page {
                seo {
                  title
                  metaDesc
                  opengraphTitle
                  opengraphDescription
                }
              }
              ... on Product {
                seo {
                  title
                  metaDesc
                  opengraphTitle
                  opengraphDescription
                }
              }
            }
            productContentType {
              seo {
                title
                metaDesc
                opengraphTitle
                opengraphDescription
              }
            }
          }
        `,
          variables: { uri: targetUri }
      }),
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const json = await res.json();
    
    if (uri === '/' && json?.data?.productContentType?.seo?.metaDesc) {
      return json.data.productContentType.seo;
    }
    
    return json?.data?.nodeByUri?.seo || json?.data?.productContentType?.seo || null;
  } catch (e) {
    return null;
  }
}
