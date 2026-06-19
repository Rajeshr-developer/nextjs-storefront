import { prisma } from '@/lib/prisma';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { created_at: 'desc' } });
  return <UsersClient users={users} />;
}
