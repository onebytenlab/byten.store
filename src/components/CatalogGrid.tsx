import ProductCard from './ProductCard';

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

interface CatalogGridProps {
  products: Product[];
  cartProductIds: number[];
}

export default function CatalogGrid({ products, cartProductIds }: CatalogGridProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .product-grid {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width: 640px) {
          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
          }
        }
      `}} />

      {products.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '2rem' }}>Товары не найдены.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isInitiallyInCart={cartProductIds.includes(product.databaseId)} 
            />
          ))}
        </div>
      )}
    </>
  );
}
