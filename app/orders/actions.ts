'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createOrder(data: { user_id: number; product_id: number; quantity: number; total_price: number; status: string }) {
  await prisma.order.create({ data });
  revalidatePath('/orders');
}

export async function updateOrderStatus(id: number, status: string) {
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath('/orders');
}

export async function deleteOrder(id: number) {
  await prisma.order.delete({ where: { id } });
  revalidatePath('/orders');
}
