import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        quizHistory: true,
        labHistory: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = {
      ...user,
      completedModules: JSON.parse(user.completedModules || '[]')
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    const body = await request.json();
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: body // Assuming body contains { fullName, password, status } etc.
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete related records first to avoid foreign key constraints
    await prisma.quizHistory.deleteMany({ where: { userId: user.id } });
    await prisma.labHistory.deleteMany({ where: { userId: user.id } });

    await prisma.user.delete({ where: { email } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
