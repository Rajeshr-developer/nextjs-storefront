import { prisma } from '@/lib/prisma';
import OrdersClient from './OrdersClient';

export default async function OrdersPage() {
  const [rawOrders, users, rawProducts] = await Promise.all([
    prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      include: { user: true, product: true },
    }),
    prisma.user.findMany({ select: { id: true, name: true } }),
    prisma.product.findMany({ select: { id: true, name: true, price: true } }),
  ]);

  const orders = rawOrders.map(o => ({
    ...o,
    total_price: Number(o.total_price ?? 0),
    created_at: o.created_at?.toISOString() ?? null,
    product: o.product ? {
      ...o.product,
      price: Number(o.product.price),
    } : null,
    user: o.user ?? null,
  }));

  const products = rawProducts.map(p => ({
    ...p,
    price: Number(p.price),
  }));

  return <OrdersClient orders={orders} users={users} products={products} />;
}