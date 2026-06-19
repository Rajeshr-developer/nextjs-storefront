'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createProduct(data: { name: string; price: number; category?: string; stock?: number }) {
  await prisma.product.create({ data });
  revalidatePath('/products');
}

export async function updateProduct(id: number, data: { name: string; price: number; category?: string; stock?: number }) {
  await prisma.product.update({ where: { id }, data });
  revalidatePath('/products');
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/products');
}
