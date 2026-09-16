import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        quizHistory: true,
        labHistory: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const parsedUsers = users.map((user: any) => ({
      ...user,
      completedModules: JSON.parse(user.completedModules || '[]')
    }));

    return NextResponse.json(parsedUsers);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
