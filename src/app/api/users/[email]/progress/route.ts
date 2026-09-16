import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    const body = await request.json();
    const { points, completedModules, quizHistoryItem, labHistoryItem } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (points !== undefined) updateData.points = points;
    if (completedModules !== undefined) updateData.completedModules = JSON.stringify(completedModules);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData
    });

    if (quizHistoryItem) {
      await prisma.quizHistory.create({
        data: {
          ...quizHistoryItem,
          userId: user.id
        }
      });
    }

    if (labHistoryItem) {
      await prisma.labHistory.create({
        data: {
          ...labHistoryItem,
          userId: user.id
        }
      });
    }

    const userData = {
      ...updatedUser,
      completedModules: JSON.parse(updatedUser.completedModules || '[]')
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
