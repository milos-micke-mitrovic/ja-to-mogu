import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[đ]/g, 'dj')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// POST - Create a new city
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, regionId, isActive, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Naziv je obavezan' }, { status: 400 });
    }

    if (!regionId) {
      return NextResponse.json({ error: 'Region je obavezan' }, { status: 400 });
    }

    // Verify region exists
    const region = await prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      return NextResponse.json({ error: 'Region nije pronađen' }, { status: 404 });
    }

    const finalSlug = slug || generateSlug(name);

    // Check if slug already exists
    const existingCity = await prisma.city.findUnique({
      where: { slug: finalSlug },
    });

    if (existingCity) {
      return NextResponse.json({ error: 'Grad sa ovim slug-om već postoji' }, { status: 400 });
    }

    const city = await prisma.city.create({
      data: {
        name,
        slug: finalSlug,
        regionId,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(city, { status: 201 });
  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json({ error: 'Greška pri kreiranju grada' }, { status: 500 });
  }
}
