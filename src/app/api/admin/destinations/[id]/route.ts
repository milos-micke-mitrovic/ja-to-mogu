import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

// PATCH - Update a country
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const existingCountry = await prisma.country.findUnique({
      where: { id },
    });

    if (!existingCountry) {
      return NextResponse.json({ error: 'Država nije pronađena' }, { status: 404 });
    }

    const body = await request.json();
    const { name, slug, isActive, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) {
      updateData.slug = slug;
    } else if (name !== undefined) {
      updateData.slug = generateSlug(name);
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Check slug uniqueness if slug is being changed
    if (updateData.slug && updateData.slug !== existingCountry.slug) {
      const slugExists = await prisma.country.findUnique({
        where: { slug: updateData.slug as string },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Država sa ovim slug-om već postoji' }, { status: 400 });
      }
    }

    const country = await prisma.country.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(country);
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json({ error: 'Greška pri ažuriranju države' }, { status: 500 });
  }
}

// DELETE - Delete a country
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemate dozvolu za ovu akciju' }, { status: 403 });
    }

    const country = await prisma.country.findUnique({
      where: { id },
    });

    if (!country) {
      return NextResponse.json({ error: 'Država nije pronađena' }, { status: 404 });
    }

    // Check if any cities under this country's regions have accommodations
    const accommodationCount = await prisma.accommodation.count({
      where: {
        city: {
          region: {
            countryId: id,
          },
        },
      },
    });

    if (accommodationCount > 0) {
      return NextResponse.json(
        { error: 'Država ima smeštaje u svojim gradovima. Prvo ih uklonite.' },
        { status: 400 }
      );
    }

    await prisma.country.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json({ error: 'Greška pri brisanju države' }, { status: 500 });
  }
}
