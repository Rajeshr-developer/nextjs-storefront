// In ProductsClient.tsx — add this import at top:
// import Link from 'next/link';

// Replace name <td> with:
<td style={{ fontWeight: 600 }}>
  <Link
    href={`/products/${p.id}`}
    style={{ color: 'var(--text)', textDecoration: 'none' }}
  >
    {p.name}
  </Link>
</td>
