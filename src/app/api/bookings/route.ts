import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendBookingConfirmationEmail, sendOwnerBookingNotification } from '@/lib/email';
import { formatDate } from '@/lib/utils';

// GET - Fetch user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        accommodation: {
          include: {
            city: true,
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        guide: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Greška pri preuzimanju rezervacija' },
      { status: 500 }
    );
  }
}

// Map frontend duration values to Prisma enum names
const DURATION_MAP: Record<string, string> = {
  '2-3': 'TWO_THREE',
  '4-7': 'FOUR_SEVEN',
  '8-10': 'EIGHT_TEN',
  '10+': 'TEN_PLUS',
};

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niste autorizovani' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      accommodationId,
      arrivalDate,
      arrivalTime,
      packageType,
      totalPrice,
      travelFormData,
      paymentData,
    } = body;

    // Validate required fields
    if (!accommodationId || !arrivalDate || !packageType) {
      return NextResponse.json(
        { error: 'Sva obavezna polja moraju biti popunjena' },
        { status: 400 }
      );
    }

    // Check if accommodation is available
    const accommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
      include: { city: true },
    });

    if (!accommodation) {
      return NextResponse.json(
        { error: 'Smeštaj nije pronađen' },
        { status: 404 }
      );
    }

    if (accommodation.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Smeštaj trenutno nije dostupan' },
        { status: 400 }
      );
    }

    // Calculate expiry (36 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 36);

    // Assign a guide if Bonus package
    let guideId = null;
    if (packageType === 'BONUS') {
      const now = new Date();
      const availableGuide = await prisma.guideAvailability.findFirst({
        where: {
          cityId: accommodation.cityId,
          isActive: true,
          availableFrom: { lte: now },
          availableTo: { gte: now },
        },
        include: {
          guide: true,
        },
      });

      if (availableGuide) {
        guideId = availableGuide.guideId;
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        accommodationId,
        guideId,
        arrivalDate: new Date(arrivalDate),
        arrivalTime,
        duration: (DURATION_MAP[travelFormData?.duration] || 'FOUR_SEVEN') as 'TWO_THREE' | 'FOUR_SEVEN' | 'EIGHT_TEN' | 'TEN_PLUS',
        packageType,
        totalPrice,
        status: 'CONFIRMED',
        journeyStatus: 'NOT_STARTED',
        expiresAt,
        // Store travel form data
        guestName: travelFormData?.name || session.user.name || 'Guest',
        guestEmail: travelFormData?.email || session.user.email || '',
        guestPhone: travelFormData?.phone || '',
        guestAddress: travelFormData?.address,
        hasViber: travelFormData?.hasViber || false,
        hasWhatsApp: travelFormData?.hasWhatsApp || false,
      },
      include: {
        accommodation: {
          include: {
            city: true,
            owner: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        guide: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    // Update accommodation status to BOOKED
    await prisma.accommodation.update({
      where: { id: accommodationId },
      data: { status: 'BOOKED' },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: session.user.id,
        amount: totalPrice,
        currency: 'RSD',
        status: 'PENDING', // Will be updated when payment is confirmed
        paymentMethod: paymentData?.paymentMethod || 'cash',
        metadata: paymentData ? {
          payerName: paymentData.name,
          payerEmail: paymentData.email,
          payerPhone: paymentData.phone,
          paidAt: paymentData.paidAt,
        } : undefined,
      },
    });

    // Send confirmation emails (don't block response)
    const guestEmail = booking.guestEmail;
    if (guestEmail) {
      sendBookingConfirmationEmail({
        bookingId: booking.id,
        guestName: booking.guestName || 'Gost',
        guestEmail,
        accommodationName: booking.accommodation.name,
        accommodationAddress: booking.accommodation.address || '',
        destination: (booking.accommodation as { city?: { name: string } }).city?.name || '',
        arrivalDate: formatDate(booking.arrivalDate.toISOString()),
        duration: booking.duration,
        packageType: booking.packageType as 'BASIC' | 'BONUS',
        totalPrice: booking.totalPrice,
        ownerName: booking.accommodation.owner?.name || undefined,
        ownerPhone: booking.accommodation.owner?.phone || undefined,
        paymentMethod: paymentData?.paymentMethod || 'cash',
      }).catch((err) => {
        console.error('Failed to send guest confirmation email:', err);
      });
    }

    // Send notification to owner
    const ownerEmail = booking.accommodation.owner?.email;
    if (ownerEmail) {
      sendOwnerBookingNotification({
        ownerName: booking.accommodation.owner?.name || 'Vlasniče',
        ownerEmail,
        guestName: booking.guestName || 'Gost',
        guestPhone: booking.guestPhone || '',
        accommodationName: booking.accommodation.name,
        arrivalDate: formatDate(booking.arrivalDate.toISOString()),
        duration: booking.duration,
        packageType: booking.packageType as 'BASIC' | 'BONUS',
      }).catch((err) => {
        console.error('Failed to send owner notification email:', err);
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Greška pri kreiranju rezervacije' },
      { status: 500 }
    );
  }
}
