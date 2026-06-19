import { prisma } from '@/lib/prisma';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const raw = await prisma.product.findMany({
    orderBy: { created_at: 'desc' }
  });

  // Convert Decimal → number before passing to Client Component
  const products = raw.map(p => ({
    ...p,
    price: Number(p.price),
    created_at: p.created_at?.toISOString() ?? null,
  }));

  return <ProductsClient products={products} />;
}