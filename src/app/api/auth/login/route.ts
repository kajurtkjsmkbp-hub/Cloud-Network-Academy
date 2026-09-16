import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'Akun Anda dinonaktifkan sementara. Hubungi guru.' },
        { status: 403 }
      );
    }

    // Parse completedModules from JSON
    const userData = {
      ...user,
      completedModules: JSON.parse(user.completedModules || '[]')
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
