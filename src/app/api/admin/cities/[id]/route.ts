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

// PATCH - Update a city
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

    const existingCity = await prisma.city.findUnique({
      where: { id },
    });

    if (!existingCity) {
      return NextResponse.json({ error: 'Grad nije pronađen' }, { status: 404 });
    }

    const body = await request.json();
    const { name, slug, regionId, isActive, sortOrder } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) {
      updateData.slug = slug;
    } else if (name !== undefined) {
      updateData.slug = generateSlug(name);
    }
    if (regionId !== undefined) updateData.regionId = regionId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Check slug uniqueness if slug is being changed
    if (updateData.slug && updateData.slug !== existingCity.slug) {
      const slugExists = await prisma.city.findUnique({
        where: { slug: updateData.slug as string },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Grad sa ovim slug-om već postoji' }, { status: 400 });
      }
    }

    // Verify region exists if regionId is being changed
    if (regionId !== undefined) {
      const region = await prisma.region.findUnique({
        where: { id: regionId },
      });
      if (!region) {
        return NextResponse.json({ error: 'Region nije pronađen' }, { status: 404 });
      }
    }

    const city = await prisma.city.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(city);
  } catch (error) {
    console.error('Error updating city:', error);
    return NextResponse.json({ error: 'Greška pri ažuriranju grada' }, { status: 500 });
  }
}

// DELETE - Delete a city
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

    const city = await prisma.city.findUnique({
      where: { id },
    });

    if (!city) {
      return NextResponse.json({ error: 'Grad nije pronađen' }, { status: 404 });
    }

    // Check if city has accommodations
    const accommodationCount = await prisma.accommodation.count({
      where: { cityId: id },
    });

    if (accommodationCount > 0) {
      return NextResponse.json(
        { error: 'Grad ima smeštaje. Prvo ih uklonite.' },
        { status: 400 }
      );
    }

    await prisma.city.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json({ error: 'Greška pri brisanju grada' }, { status: 500 });
  }
}
