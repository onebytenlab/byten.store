interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryMenuProps {
  activeCategory: string;
}

export default function CategoryMenu({ activeCategory }: CategoryMenuProps) {
  const staticCategories: Category[] = [
    { id: '1', name: 'Steam', slug: 'steam' },
    { id: '2', name: 'PlayStation', slug: 'playstation' },
    { id: '3', name: 'Xbox', slug: 'xbox' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      marginBottom: '2rem', 
      flexWrap: 'wrap',
      justifyContent: 'center'
    }}>
      <a
        href="?"
        style={{
          backgroundColor: activeCategory === 'all' ? '#22d3ee' : '#1f2937',
          color: activeCategory === 'all' ? '#111827' : '#9ca3af',
          textDecoration: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: 700,
          fontSize: '0.85rem',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s'
        }}
      >
        Все товары
      </a>

      {staticCategories.map((category) => (
        <a
          key={category.id}
          href={`?category=${category.slug}`}
          style={{
            backgroundColor: activeCategory === category.slug ? '#22d3ee' : '#1f2937',
            color: activeCategory === category.slug ? '#111827' : '#9ca3af',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
          }}
        >
          {category.name}
        </a>
      ))}
    </div>
  );
}
