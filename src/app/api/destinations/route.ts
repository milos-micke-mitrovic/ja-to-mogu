import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      include: {
        regions: {
          where: { isActive: true },
          include: {
            cities: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json({ error: 'Greška pri preuzimanju destinacija' }, { status: 500 });
  }
}
