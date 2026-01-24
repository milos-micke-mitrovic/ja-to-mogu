import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Clearing existing data...');
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seasonalPrice.deleteMany();
  await prisma.guideAvailability.deleteMany();
  await prisma.accommodation.deleteMany();
  await prisma.locationAvailability.deleteMany();
  await prisma.packageSetting.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users (same password for testing: "password123")
  const hashedPassword = await hash('password123', 12);

  // Create Admin user
  console.log('👤 Creating Admin user...');
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@jatomogu.rs',
      hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      phone: '+381601234567',
    },
  });

  // Create Owner users
  console.log('👤 Creating Owner users...');
  const owner1 = await prisma.user.create({
    data: {
      name: 'Marko Vlasnik',
      email: 'vlasnik@jatomogu.rs',
      hashedPassword,
      role: 'OWNER',
      emailVerified: new Date(),
      phone: '+381611234567',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Jelena Vlasnik',
      email: 'jelena.vlasnik@jatomogu.rs',
      hashedPassword,
      role: 'OWNER',
      emailVerified: new Date(),
      phone: '+381621234567',
    },
  });

  // Create Guide users
  console.log('👤 Creating Guide users...');
  const guide1 = await prisma.user.create({
    data: {
      name: 'Nikola Vodič',
      email: 'vodic@jatomogu.rs',
      hashedPassword,
      role: 'GUIDE',
      emailVerified: new Date(),
      phone: '+381631234567',
    },
  });

  const guide2 = await prisma.user.create({
    data: {
      name: 'Ana Vodič',
      email: 'ana.vodic@jatomogu.rs',
      hashedPassword,
      role: 'GUIDE',
      emailVerified: new Date(),
      phone: '+381641234567',
    },
  });

  // Create Client users
  console.log('👤 Creating Client users...');
  const client1 = await prisma.user.create({
    data: {
      name: 'Petar Klijent',
      email: 'klijent@jatomogu.rs',
      hashedPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
      phone: '+381651234567',
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: 'Milica Klijent',
      email: 'milica.klijent@jatomogu.rs',
      hashedPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
      phone: '+381661234567',
    },
  });

  // Create Package Settings
  console.log('📦 Creating package settings...');
  await prisma.packageSetting.createMany({
    data: [
      { packageType: 'BASIC', price: 3000, isActive: true },
      { packageType: 'BONUS', price: 7000, isActive: true },
    ],
  });

  // Create Accommodations
  console.log('🏠 Creating accommodations...');
  const accommodation1 = await prisma.accommodation.create({
    data: {
      name: 'Apartman Sunce',
      description: 'Prekrasan apartman sa pogledom na more, samo 50m od plaže. Idealan za porodice.',
      type: 'Apartman',
      destination: 'POLIHRONO',
      address: 'Ulica Sunca 15, Polihrono',
      latitude: 39.9833,
      longitude: 23.3667,
      beds: 4,
      rooms: 2,
      hasParking: true,
      hasAC: true,
      hasWifi: true,
      hasKitchen: true,
      hasPool: false,
      hasSeaView: true,
      distanceToBeach: 50,
      images: [],
      canReceiveFrom: '14:00',
      canReceiveTo: '22:00',
      ownerId: owner1.id,
      status: 'AVAILABLE',
      seasonalPrices: {
        create: [
          { season: 'LOW', duration: 'TWO_THREE', pricePerNight: 3300 },
          { season: 'LOW', duration: 'FOUR_SEVEN', pricePerNight: 3000 },
          { season: 'LOW', duration: 'EIGHT_TEN', pricePerNight: 2850 },
          { season: 'LOW', duration: 'TEN_PLUS', pricePerNight: 2700 },
          { season: 'HIGH', duration: 'TWO_THREE', pricePerNight: 5500 },
          { season: 'HIGH', duration: 'FOUR_SEVEN', pricePerNight: 5000 },
          { season: 'HIGH', duration: 'EIGHT_TEN', pricePerNight: 4750 },
          { season: 'HIGH', duration: 'TEN_PLUS', pricePerNight: 4500 },
        ],
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      name: 'Vila Maslina',
      description: 'Luksuzna vila sa privatnim bazenom i vrtom. Savršeno za veće grupe.',
      type: 'Vila',
      destination: 'HANIOTI',
      address: 'Put Maslina 8, Hanioti',
      latitude: 39.9500,
      longitude: 23.4500,
      beds: 8,
      rooms: 4,
      hasParking: true,
      hasAC: true,
      hasWifi: true,
      hasKitchen: true,
      hasPool: true,
      hasSeaView: true,
      distanceToBeach: 200,
      images: [],
      canReceiveFrom: '15:00',
      canReceiveTo: '21:00',
      ownerId: owner1.id,
      status: 'AVAILABLE',
      seasonalPrices: {
        create: [
          { season: 'LOW', duration: 'TWO_THREE', pricePerNight: 8800 },
          { season: 'LOW', duration: 'FOUR_SEVEN', pricePerNight: 8000 },
          { season: 'LOW', duration: 'EIGHT_TEN', pricePerNight: 7600 },
          { season: 'LOW', duration: 'TEN_PLUS', pricePerNight: 7200 },
          { season: 'HIGH', duration: 'TWO_THREE', pricePerNight: 13200 },
          { season: 'HIGH', duration: 'FOUR_SEVEN', pricePerNight: 12000 },
          { season: 'HIGH', duration: 'EIGHT_TEN', pricePerNight: 11400 },
          { season: 'HIGH', duration: 'TEN_PLUS', pricePerNight: 10800 },
        ],
      },
    },
  });

  const accommodation3 = await prisma.accommodation.create({
    data: {
      name: 'Studio More',
      description: 'Udoban studio apartman na prvoj liniji do mora. Idealan za parove.',
      type: 'Studio',
      destination: 'NIKITI',
      address: 'Obala 22, Nikiti',
      latitude: 40.2167,
      longitude: 23.6667,
      beds: 2,
      rooms: 1,
      hasParking: true,
      hasAC: true,
      hasWifi: true,
      hasKitchen: true,
      hasPool: false,
      hasSeaView: true,
      distanceToBeach: 20,
      images: [],
      canReceiveFrom: '14:00',
      canReceiveTo: '20:00',
      ownerId: owner2.id,
      status: 'AVAILABLE',
      seasonalPrices: {
        create: [
          { season: 'LOW', duration: 'TWO_THREE', pricePerNight: 2750 },
          { season: 'LOW', duration: 'FOUR_SEVEN', pricePerNight: 2500 },
          { season: 'LOW', duration: 'EIGHT_TEN', pricePerNight: 2375 },
          { season: 'LOW', duration: 'TEN_PLUS', pricePerNight: 2250 },
          { season: 'HIGH', duration: 'TWO_THREE', pricePerNight: 4400 },
          { season: 'HIGH', duration: 'FOUR_SEVEN', pricePerNight: 4000 },
          { season: 'HIGH', duration: 'EIGHT_TEN', pricePerNight: 3800 },
          { season: 'HIGH', duration: 'TEN_PLUS', pricePerNight: 3600 },
        ],
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      name: 'Apartman Olimp',
      description: 'Moderan apartman u blizini Olimpa. Pogodan za ljubitelje prirode i planinarenja.',
      type: 'Apartman',
      destination: 'PARALIJA',
      address: 'Olimpska 45, Paralija',
      latitude: 40.2667,
      longitude: 22.6000,
      beds: 5,
      rooms: 2,
      hasParking: true,
      hasAC: true,
      hasWifi: true,
      hasKitchen: true,
      hasPool: false,
      hasSeaView: false,
      distanceToBeach: 300,
      images: [],
      canReceiveFrom: '13:00',
      canReceiveTo: '23:00',
      ownerId: owner2.id,
      status: 'AVAILABLE',
      seasonalPrices: {
        create: [
          { season: 'LOW', duration: 'TWO_THREE', pricePerNight: 2200 },
          { season: 'LOW', duration: 'FOUR_SEVEN', pricePerNight: 2000 },
          { season: 'LOW', duration: 'EIGHT_TEN', pricePerNight: 1900 },
          { season: 'LOW', duration: 'TEN_PLUS', pricePerNight: 1800 },
          { season: 'HIGH', duration: 'TWO_THREE', pricePerNight: 3300 },
          { season: 'HIGH', duration: 'FOUR_SEVEN', pricePerNight: 3000 },
          { season: 'HIGH', duration: 'EIGHT_TEN', pricePerNight: 2850 },
          { season: 'HIGH', duration: 'TEN_PLUS', pricePerNight: 2700 },
        ],
      },
    },
  });

  // Create Guide Availabilities
  console.log('📅 Creating guide availabilities...');
  const now = new Date();
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  await prisma.guideAvailability.createMany({
    data: [
      {
        guideId: guide1.id,
        destination: 'POLIHRONO',
        availableFrom: now,
        availableTo: threeMonthsLater,
        isActive: true,
      },
      {
        guideId: guide1.id,
        destination: 'HANIOTI',
        availableFrom: now,
        availableTo: threeMonthsLater,
        isActive: true,
      },
      {
        guideId: guide2.id,
        destination: 'NIKITI',
        availableFrom: now,
        availableTo: threeMonthsLater,
        isActive: true,
      },
      {
        guideId: guide2.id,
        destination: 'PARALIJA',
        availableFrom: now,
        availableTo: threeMonthsLater,
        isActive: true,
      },
    ],
  });

  // Create a sample completed booking with review
  console.log('📝 Creating sample booking and review...');
  const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const pastExpiry = new Date(pastDate.getTime() + 36 * 60 * 60 * 1000);

  const completedBooking = await prisma.booking.create({
    data: {
      userId: client1.id,
      accommodationId: accommodation1.id,
      guideId: guide1.id,
      arrivalDate: pastDate,
      arrivalTime: '15:00',
      duration: 'FOUR_SEVEN',
      packageType: 'BONUS',
      totalPrice: 42000, // 7 nights * 5000 + 7000 bonus
      status: 'COMPLETED',
      journeyStatus: 'ARRIVED',
      expiresAt: pastExpiry,
      guestName: 'Petar Klijent',
      guestEmail: 'klijent@jatomogu.rs',
      guestPhone: '+381651234567',
      hasViber: true,
      hasWhatsApp: true,
    },
  });

  // Create review for the completed booking
  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      userId: client1.id,
      accommodationId: accommodation1.id,
      rating: 5,
      comment: 'Odličan smeštaj! Vlasnik je bio jako ljubazan, apartman čist i udoban. Preporučujem svima!',
      isVerified: true,
    },
  });

  // Create payment for completed booking
  await prisma.payment.create({
    data: {
      bookingId: completedBooking.id,
      userId: client1.id,
      amount: 42000,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'platform',
    },
  });

  // Create an active booking
  console.log('📝 Creating active booking...');
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const futureExpiry = new Date(now.getTime() + 36 * 60 * 60 * 1000);

  const activeBooking = await prisma.booking.create({
    data: {
      userId: client2.id,
      accommodationId: accommodation3.id,
      guideId: null,
      arrivalDate: futureDate,
      arrivalTime: '16:00',
      duration: 'TWO_THREE',
      packageType: 'BASIC',
      totalPrice: 11000, // 3 nights * 2750 + 3000 basic
      status: 'CONFIRMED',
      journeyStatus: 'NOT_STARTED',
      expiresAt: futureExpiry,
      guestName: 'Milica Klijent',
      guestEmail: 'milica.klijent@jatomogu.rs',
      guestPhone: '+381661234567',
      hasViber: true,
      hasWhatsApp: false,
    },
  });

  // Update accommodation status
  await prisma.accommodation.update({
    where: { id: accommodation3.id },
    data: { status: 'BOOKED' },
  });

  // Create pending payment for active booking
  await prisma.payment.create({
    data: {
      bookingId: activeBooking.id,
      userId: client2.id,
      amount: 11000,
      currency: 'RSD',
      status: 'PENDING',
      paymentMethod: 'platform',
    },
  });

  console.log('✅ Seed completed!');
  console.log('');
  console.log('📋 Test accounts (password: password123):');
  console.log('   Admin:  admin@jatomogu.rs');
  console.log('   Owner:  vlasnik@jatomogu.rs, jelena.vlasnik@jatomogu.rs');
  console.log('   Guide:  vodic@jatomogu.rs, ana.vodic@jatomogu.rs');
  console.log('   Client: klijent@jatomogu.rs, milica.klijent@jatomogu.rs');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
