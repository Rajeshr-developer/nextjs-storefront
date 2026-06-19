'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createUser(data: {
  name: string; email: string; age?: number; role?: string; active?: boolean;
}) {
  await prisma.user.create({ data });
  revalidatePath('/users');
}

export async function updateUser(id: number, data: {
  name: string; email: string; age?: number; role?: string; active?: boolean;
}) {
  await prisma.user.update({ where: { id }, data });
  revalidatePath('/users');
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
  revalidatePath('/users');
}
