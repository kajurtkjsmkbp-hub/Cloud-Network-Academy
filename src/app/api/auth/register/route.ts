import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, role } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar.' },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        fullName: fullName || email.split('@')[0],
        role: role || 'student',
        status: 'active',
        points: 0,
        completedModules: '[]'
      }
    });

    const userData = {
      ...newUser,
      completedModules: []
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
