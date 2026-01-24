import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET - Fetch all settings (admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    // Fetch package settings
    const packageSettings = await prisma.packageSetting.findMany({
      orderBy: { packageType: 'asc' },
    });

    // Fetch location availability
    const locationAvailability = await prisma.locationAvailability.findMany({
      orderBy: { destination: 'asc' },
    });

    // Transform to easier format
    const packages = {
      BASIC: packageSettings.find((p) => p.packageType === 'BASIC'),
      BONUS: packageSettings.find((p) => p.packageType === 'BONUS'),
    };

    const unavailableLocations = locationAvailability
      .filter((l) => !l.isAvailable)
      .map((l) => l.destination);

    return NextResponse.json({
      packages,
      packageSettings,
      locationAvailability,
      unavailableLocations,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju podešavanja' },
      { status: 500 }
    );
  }
}

// PATCH - Update settings (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nemate dozvolu za ovu akciju' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { packageSettings, unavailableLocations } = body;

    // Update package settings if provided
    if (packageSettings) {
      for (const setting of packageSettings) {
        await prisma.packageSetting.upsert({
          where: { packageType: setting.packageType },
          update: {
            price: setting.price,
            isActive: setting.isActive ?? true,
          },
          create: {
            packageType: setting.packageType,
            price: setting.price,
            isActive: setting.isActive ?? true,
          },
        });
      }
    }

    // Update location availability if provided
    if (unavailableLocations !== undefined) {
      // Get all destinations from enum
      const allDestinations = [
        'POLIHRONO', 'KALITEA', 'HANIOTI', 'PEFKOHORI', 'SIVIRI', 'KASANDRA_OTHER',
        'NIKITI', 'NEOS_MARMARAS', 'SARTI', 'VOURVOUROU', 'SITONIJA_OTHER',
        'PARALIJA', 'OLIMPIK_BIC', 'LEPTOKARIJA', 'PLATAMONA'
      ];

      // Update each destination
      for (const destination of allDestinations) {
        const isAvailable = !unavailableLocations.includes(destination);

        await prisma.locationAvailability.upsert({
          where: { destination: destination as never },
          update: { isAvailable },
          create: {
            destination: destination as never,
            isAvailable,
          },
        });
      }
    }

    // Fetch updated settings
    const updatedPackageSettings = await prisma.packageSetting.findMany({
      orderBy: { packageType: 'asc' },
    });

    const updatedLocationAvailability = await prisma.locationAvailability.findMany({
      orderBy: { destination: 'asc' },
    });

    return NextResponse.json({
      packageSettings: updatedPackageSettings,
      locationAvailability: updatedLocationAvailability,
      unavailableLocations: updatedLocationAvailability
        .filter((l) => !l.isAvailable)
        .map((l) => l.destination),
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Greška pri ažuriranju podešavanja' },
      { status: 500 }
    );
  }
}
