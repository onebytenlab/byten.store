'use server';

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
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 NextJS-Frontend',
        'Host': 'api.byten.store'
      },
      body: JSON.stringify({
        query: `
          query GetBlogPostBySlug($id: ID!) {
            post(id: $id, idType: SLUG) {
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
        variables: { id: slug }
      }),
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.post || null;
  } catch (e) {
    return null;
  }
}
