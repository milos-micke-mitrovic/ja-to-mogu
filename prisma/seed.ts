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
  await prisma.city.deleteMany();
  await prisma.region.deleteMany();
  await prisma.country.deleteMany();

  // Hash password for all users (same password for testing: "password123")
  const hashedPassword = await hash('password123', 12);

  // Create Countries
  console.log('🌍 Creating countries...');
  const greece = await prisma.country.create({
    data: {
      name: 'Grčka',
      slug: 'grcka',
      isActive: true,
      sortOrder: 1,
    },
  });

  // Create Regions
  console.log('🗺️ Creating regions...');
  const kasandra = await prisma.region.create({
    data: {
      name: 'Kasandra',
      slug: 'kasandra',
      countryId: greece.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  const sitonija = await prisma.region.create({
    data: {
      name: 'Sitonija',
      slug: 'sitonija',
      countryId: greece.id,
      isActive: true,
      sortOrder: 2,
    },
  });

  const olimpska = await prisma.region.create({
    data: {
      name: 'Olimpska regija',
      slug: 'olimpska-regija',
      countryId: greece.id,
      isActive: true,
      sortOrder: 3,
    },
  });

  // Create Montenegro
  console.log('🌍 Creating Montenegro...');
  const montenegro = await prisma.country.create({
    data: {
      name: 'Crna Gora',
      slug: 'crna-gora',
      isActive: true,
      sortOrder: 2,
    },
  });

  const crnogorskoPrivorje = await prisma.region.create({
    data: {
      name: 'Crnogorsko primorje',
      slug: 'crnogorsko-primorje',
      countryId: montenegro.id,
      isActive: true,
      sortOrder: 1,
    },
  });

  // Create Cities
  console.log('🏙️ Creating cities...');
  const cityData = [
    // Kasandra
    { name: 'Polihrono', slug: 'polihrono', regionId: kasandra.id, sortOrder: 1 },
    { name: 'Kalitea', slug: 'kalitea', regionId: kasandra.id, sortOrder: 2 },
    { name: 'Hanioti', slug: 'hanioti', regionId: kasandra.id, sortOrder: 3 },
    { name: 'Pefkohori', slug: 'pefkohori', regionId: kasandra.id, sortOrder: 4 },
    { name: 'Siviri', slug: 'siviri', regionId: kasandra.id, sortOrder: 5 },
    { name: 'Kasandra - Ostalo', slug: 'kasandra-ostalo', regionId: kasandra.id, sortOrder: 6 },
    // Sitonija
    { name: 'Nikiti', slug: 'nikiti', regionId: sitonija.id, sortOrder: 1 },
    { name: 'Neos Marmaras', slug: 'neos-marmaras', regionId: sitonija.id, sortOrder: 2 },
    { name: 'Sarti', slug: 'sarti', regionId: sitonija.id, sortOrder: 3 },
    { name: 'Vourvourou', slug: 'vourvourou', regionId: sitonija.id, sortOrder: 4 },
    { name: 'Sitonija - Ostalo', slug: 'sitonija-ostalo', regionId: sitonija.id, sortOrder: 5 },
    // Olimpska
    { name: 'Paralija', slug: 'paralija', regionId: olimpska.id, sortOrder: 1 },
    { name: 'Olimpik Bič', slug: 'olimpik-bic', regionId: olimpska.id, sortOrder: 2 },
    { name: 'Leptokarija', slug: 'leptokarija', regionId: olimpska.id, sortOrder: 3 },
    { name: 'Platamona', slug: 'platamona', regionId: olimpska.id, sortOrder: 4 },
    // Crna Gora - Primorje
    { name: 'Herceg Novi', slug: 'herceg-novi', regionId: crnogorskoPrivorje.id, sortOrder: 1 },
    { name: 'Kotor', slug: 'kotor', regionId: crnogorskoPrivorje.id, sortOrder: 2 },
    { name: 'Tivat', slug: 'tivat', regionId: crnogorskoPrivorje.id, sortOrder: 3 },
    { name: 'Budva', slug: 'budva', regionId: crnogorskoPrivorje.id, sortOrder: 4 },
    { name: 'Bečići', slug: 'becici', regionId: crnogorskoPrivorje.id, sortOrder: 5 },
    { name: 'Petrovac', slug: 'petrovac', regionId: crnogorskoPrivorje.id, sortOrder: 6 },
    { name: 'Sutomore', slug: 'sutomore', regionId: crnogorskoPrivorje.id, sortOrder: 7 },
    { name: 'Bar', slug: 'bar', regionId: crnogorskoPrivorje.id, sortOrder: 8 },
    { name: 'Ulcinj', slug: 'ulcinj', regionId: crnogorskoPrivorje.id, sortOrder: 9 },
  ];

  const cities = {} as Record<string, string>;
  for (const city of cityData) {
    const created = await prisma.city.create({ data: city });
    cities[city.slug] = created.id;
  }

  const cityId = (slug: string) => {
    const id = cities[slug];
    if (!id) throw new Error(`City not found: ${slug}`);
    return id;
  };

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
      cityId: cityId('polihrono'),
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
      cityId: cityId('hanioti'),
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
      cityId: cityId('nikiti'),
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

  const accommodation4 = await prisma.accommodation.create({
    data: {
      name: 'Apartman Olimp',
      description: 'Moderan apartman u blizini Olimpa. Pogodan za ljubitelje prirode i planinarenja.',
      type: 'Apartman',
      cityId: cityId('paralija'),
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

  // Montenegro accommodations
  const accommodation5 = await prisma.accommodation.create({
    data: {
      name: 'Apartman Jadran',
      description: 'Udoban apartman u starom gradu Budve, na 2 minuta od plaže Mogren.',
      type: 'Apartman',
      cityId: cityId('budva'),
      address: 'Starogradska 12, Budva',
      latitude: 42.2889,
      longitude: 18.8403,
      beds: 3,
      rooms: 1,
      hasParking: false,
      hasAC: true,
      hasWifi: true,
      hasKitchen: true,
      hasPool: false,
      hasSeaView: true,
      distanceToBeach: 100,
      images: [],
      canReceiveFrom: '14:00',
      canReceiveTo: '22:00',
      ownerId: owner1.id,
      status: 'AVAILABLE',
      seasonalPrices: {
        create: [
          { season: 'LOW', duration: 'TWO_THREE', pricePerNight: 4000 },
          { season: 'LOW', duration: 'FOUR_SEVEN', pricePerNight: 3500 },
          { season: 'LOW', duration: 'EIGHT_TEN', pricePerNight: 3200 },
          { season: 'LOW', duration: 'TEN_PLUS', pricePerNight: 3000 },
          { season: 'HIGH', duration: 'TWO_THREE', pricePerNight: 6500 },
          { season: 'HIGH', duration: 'FOUR_SEVEN', pricePerNight: 6000 },
          { season: 'HIGH', duration: 'EIGHT_TEN', pricePerNight: 5500 },
          { season: 'HIGH', duration: 'TEN_PLUS', pricePerNight: 5000 },
        ],
      },
    },
  });

  const accommodation6 = await prisma.accommodation.create({
    data: {
      name: 'Vila Boka',
      description: 'Luksuzna vila sa pogledom na Bokokotorski zaliv. Privatni bazen i parking.',
      type: 'Vila',
      cityId: cityId('kotor'),
      address: 'Zaljevski put 34, Kotor',
      latitude: 42.4247,
      longitude: 18.7712,
      beds: 6,
      rooms: 3,
      hasParking: true,
      hasAC: true,
      hasWifi: true,
      hasKitchen: true,
      hasPool: true,
      hasSeaView: true,
      distanceToBeach: 150,
      images: [],
      canReceiveFrom: '15:00',
      canReceiveTo: '21:00',
      ownerId: owner2.id,
      status: 'AVAILABLE',
      seasonalPrices: {
        create: [
          { season: 'LOW', duration: 'TWO_THREE', pricePerNight: 9000 },
          { season: 'LOW', duration: 'FOUR_SEVEN', pricePerNight: 8000 },
          { season: 'LOW', duration: 'EIGHT_TEN', pricePerNight: 7500 },
          { season: 'LOW', duration: 'TEN_PLUS', pricePerNight: 7000 },
          { season: 'HIGH', duration: 'TWO_THREE', pricePerNight: 14000 },
          { season: 'HIGH', duration: 'FOUR_SEVEN', pricePerNight: 12500 },
          { season: 'HIGH', duration: 'EIGHT_TEN', pricePerNight: 11500 },
          { season: 'HIGH', duration: 'TEN_PLUS', pricePerNight: 10500 },
        ],
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      name: 'Studio Mediteran',
      description: 'Kompaktan studio na plaži Bečići, savršen za parove. Sve na dohvat ruke.',
      type: 'Studio',
      cityId: cityId('becici'),
      address: 'Primorska bb, Bečići',
      latitude: 42.2833,
      longitude: 18.8567,
      beds: 2,
      rooms: 1,
      hasParking: true,
      hasAC: true,
      hasWifi: true,
      hasKitchen: false,
      hasPool: false,
      hasSeaView: true,
      distanceToBeach: 30,
      images: [],
      canReceiveFrom: '14:00',
      canReceiveTo: '20:00',
      ownerId: owner1.id,
      status: 'AVAILABLE',
      seasonalPrices: {
        create: [
          { season: 'LOW', duration: 'TWO_THREE', pricePerNight: 3000 },
          { season: 'LOW', duration: 'FOUR_SEVEN', pricePerNight: 2700 },
          { season: 'LOW', duration: 'EIGHT_TEN', pricePerNight: 2500 },
          { season: 'LOW', duration: 'TEN_PLUS', pricePerNight: 2300 },
          { season: 'HIGH', duration: 'TWO_THREE', pricePerNight: 5000 },
          { season: 'HIGH', duration: 'FOUR_SEVEN', pricePerNight: 4500 },
          { season: 'HIGH', duration: 'EIGHT_TEN', pricePerNight: 4200 },
          { season: 'HIGH', duration: 'TEN_PLUS', pricePerNight: 4000 },
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
        cityId: cityId('polihrono'),
        availableFrom: now,
        availableTo: threeMonthsLater,
        isActive: true,
      },
      {
        guideId: guide1.id,
        cityId: cityId('hanioti'),
        availableFrom: now,
        availableTo: threeMonthsLater,
        isActive: true,
      },
      {
        guideId: guide2.id,
        cityId: cityId('nikiti'),
        availableFrom: now,
        availableTo: threeMonthsLater,
        isActive: true,
      },
      {
        guideId: guide2.id,
        cityId: cityId('paralija'),
        availableFrom: now,
        availableTo: threeMonthsLater,
        isActive: true,
      },
    ],
  });

  // ===== BOOKINGS FOR CLIENT 1 (Petar Klijent) =====
  console.log('📝 Creating bookings for client1...');

  // 1. Completed booking with review (30 days ago) — Polihrono, BONUS
  const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const booking1 = await prisma.booking.create({
    data: {
      userId: client1.id,
      accommodationId: accommodation1.id,
      guideId: guide1.id,
      arrivalDate: past30,
      arrivalTime: '15:00',
      duration: 'FOUR_SEVEN',
      packageType: 'BONUS',
      totalPrice: 42000,
      status: 'COMPLETED',
      journeyStatus: 'ARRIVED',
      expiresAt: new Date(past30.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Petar Klijent',
      guestEmail: 'klijent@jatomogu.rs',
      guestPhone: '+381651234567',
      hasViber: true,
      hasWhatsApp: true,
    },
  });
  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      userId: client1.id,
      accommodationId: accommodation1.id,
      rating: 5,
      comment: 'Odličan smeštaj! Vlasnik je bio jako ljubazan, apartman čist i udoban. Preporučujem svima!',
      isVerified: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      userId: client1.id,
      amount: 42000,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'bank_transfer',
    },
  });

  // 2. Completed booking WITHOUT review (60 days ago) — Nikiti, BASIC
  const past60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const booking2 = await prisma.booking.create({
    data: {
      userId: client1.id,
      accommodationId: accommodation3.id,
      arrivalDate: past60,
      arrivalTime: '18:00',
      duration: 'TWO_THREE',
      packageType: 'BASIC',
      totalPrice: 11250,
      status: 'COMPLETED',
      journeyStatus: 'ARRIVED',
      expiresAt: new Date(past60.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Petar Klijent',
      guestEmail: 'klijent@jatomogu.rs',
      guestPhone: '+381651234567',
      hasViber: true,
      hasWhatsApp: false,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      userId: client1.id,
      amount: 11250,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'cash',
    },
  });

  // 3. Cancelled booking (45 days ago) — Budva
  const past45 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
  const booking3 = await prisma.booking.create({
    data: {
      userId: client1.id,
      accommodationId: accommodation5.id,
      arrivalDate: past45,
      arrivalTime: '14:00',
      duration: 'EIGHT_TEN',
      packageType: 'BASIC',
      totalPrice: 35000,
      status: 'CANCELLED',
      journeyStatus: 'NOT_STARTED',
      expiresAt: new Date(past45.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Petar Klijent',
      guestEmail: 'klijent@jatomogu.rs',
      guestPhone: '+381651234567',
      hasViber: true,
      hasWhatsApp: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      userId: client1.id,
      amount: 35000,
      currency: 'RSD',
      status: 'REFUNDED',
      paymentMethod: 'bank_transfer',
    },
  });

  // 4. Completed booking with review (90 days ago) — Kotor, BONUS
  const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const booking4 = await prisma.booking.create({
    data: {
      userId: client1.id,
      accommodationId: accommodation6.id,
      guideId: guide2.id,
      arrivalDate: past90,
      arrivalTime: '16:00',
      duration: 'FOUR_SEVEN',
      packageType: 'BONUS',
      totalPrice: 94500,
      status: 'COMPLETED',
      journeyStatus: 'ARRIVED',
      expiresAt: new Date(past90.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Petar Klijent',
      guestEmail: 'klijent@jatomogu.rs',
      guestPhone: '+381651234567',
      hasViber: false,
      hasWhatsApp: true,
    },
  });
  await prisma.review.create({
    data: {
      bookingId: booking4.id,
      userId: client1.id,
      accommodationId: accommodation6.id,
      rating: 4,
      comment: 'Prelepa vila sa fantastičnim pogledom na zaliv. Jedini minus je što je parking malo daleko.',
      isVerified: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking4.id,
      userId: client1.id,
      amount: 94500,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'bank_transfer',
    },
  });

  // 5. Active/confirmed booking for client1 (future) — Paralija
  const future14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const booking5 = await prisma.booking.create({
    data: {
      userId: client1.id,
      accommodationId: accommodation4.id,
      arrivalDate: future14,
      arrivalTime: '17:00',
      duration: 'FOUR_SEVEN',
      packageType: 'BASIC',
      totalPrice: 24000,
      status: 'CONFIRMED',
      journeyStatus: 'NOT_STARTED',
      expiresAt: new Date(now.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Petar Klijent',
      guestEmail: 'klijent@jatomogu.rs',
      guestPhone: '+381651234567',
      hasViber: true,
      hasWhatsApp: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking5.id,
      userId: client1.id,
      amount: 24000,
      currency: 'RSD',
      status: 'PENDING',
      paymentMethod: 'cash',
    },
  });

  // ===== BOOKINGS FOR CLIENT 2 (Milica Klijent) =====
  console.log('📝 Creating bookings for client2...');

  // 6. Completed booking with review (20 days ago) — Hanioti, BASIC
  const past20 = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
  const booking6 = await prisma.booking.create({
    data: {
      userId: client2.id,
      accommodationId: accommodation1.id,
      arrivalDate: past20,
      arrivalTime: '19:00',
      duration: 'EIGHT_TEN',
      packageType: 'BASIC',
      totalPrice: 53000,
      status: 'COMPLETED',
      journeyStatus: 'ARRIVED',
      expiresAt: new Date(past20.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Milica Klijent',
      guestEmail: 'milica.klijent@jatomogu.rs',
      guestPhone: '+381661234567',
      hasViber: true,
      hasWhatsApp: false,
    },
  });
  await prisma.review.create({
    data: {
      bookingId: booking6.id,
      userId: client2.id,
      accommodationId: accommodation1.id,
      rating: 4,
      comment: 'Lep apartman, blizu plaže. Malo bučno noću ali sve u svemu dobro iskustvo.',
      isVerified: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking6.id,
      userId: client2.id,
      amount: 53000,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'cash',
    },
  });

  // 7. Completed booking WITHOUT review (50 days ago) — Budva, BONUS
  const past50 = new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000);
  const booking7 = await prisma.booking.create({
    data: {
      userId: client2.id,
      accommodationId: accommodation5.id,
      guideId: guide1.id,
      arrivalDate: past50,
      arrivalTime: '12:00',
      duration: 'TEN_PLUS',
      packageType: 'BONUS',
      totalPrice: 77000,
      status: 'COMPLETED',
      journeyStatus: 'ARRIVED',
      expiresAt: new Date(past50.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Milica Klijent',
      guestEmail: 'milica.klijent@jatomogu.rs',
      guestPhone: '+381661234567',
      hasViber: true,
      hasWhatsApp: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking7.id,
      userId: client2.id,
      amount: 77000,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'bank_transfer',
    },
  });

  // 8. NO_SHOW booking (35 days ago) — Paralija
  const past35 = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  const booking8 = await prisma.booking.create({
    data: {
      userId: client2.id,
      accommodationId: accommodation4.id,
      arrivalDate: past35,
      arrivalTime: '20:00',
      duration: 'TWO_THREE',
      packageType: 'BASIC',
      totalPrice: 9900,
      status: 'NO_SHOW',
      journeyStatus: 'NOT_STARTED',
      expiresAt: new Date(past35.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Milica Klijent',
      guestEmail: 'milica.klijent@jatomogu.rs',
      guestPhone: '+381661234567',
      hasViber: false,
      hasWhatsApp: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking8.id,
      userId: client2.id,
      amount: 9900,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'cash',
    },
  });

  // 9. Active/confirmed booking for client2 (future) — Nikiti
  const future7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const booking9 = await prisma.booking.create({
    data: {
      userId: client2.id,
      accommodationId: accommodation3.id,
      arrivalDate: future7,
      arrivalTime: '16:00',
      duration: 'TWO_THREE',
      packageType: 'BASIC',
      totalPrice: 11250,
      status: 'CONFIRMED',
      journeyStatus: 'NOT_STARTED',
      expiresAt: new Date(now.getTime() + 36 * 60 * 60 * 1000),
      guestName: 'Milica Klijent',
      guestEmail: 'milica.klijent@jatomogu.rs',
      guestPhone: '+381661234567',
      hasViber: true,
      hasWhatsApp: false,
    },
  });

  // ===== BONUS BOOKINGS WITH GUIDES (active, for guide dashboard testing) =====
  console.log('📝 Creating active guide bookings...');

  // 10. Confirmed BONUS booking for client1, guide1 — arriving in 3 days, Polihrono
  const future3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const booking10 = await prisma.booking.create({
    data: {
      userId: client1.id,
      accommodationId: accommodation1.id,
      guideId: guide1.id,
      arrivalDate: future3,
      arrivalTime: '14:00',
      duration: 'FOUR_SEVEN',
      packageType: 'BONUS',
      totalPrice: 42000,
      status: 'CONFIRMED',
      journeyStatus: 'NOT_STARTED',
      expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      guestName: 'Petar Klijent',
      guestEmail: 'klijent@jatomogu.rs',
      guestPhone: '+381651234567',
      hasViber: true,
      hasWhatsApp: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking10.id,
      userId: client1.id,
      amount: 42000,
      currency: 'RSD',
      status: 'PENDING',
      paymentMethod: 'bank_transfer',
    },
  });

  // 11. Confirmed BONUS booking for client2, guide1 — arriving today, Hanioti (for today's clients)
  const todayDate = new Date();
  todayDate.setHours(16, 0, 0, 0);
  const booking11 = await prisma.booking.create({
    data: {
      userId: client2.id,
      accommodationId: accommodation1.id,
      guideId: guide1.id,
      arrivalDate: todayDate,
      arrivalTime: '16:00',
      duration: 'TWO_THREE',
      packageType: 'BONUS',
      totalPrice: 23100,
      status: 'CONFIRMED',
      journeyStatus: 'DEPARTED',
      departedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      guestName: 'Milica Klijent',
      guestEmail: 'milica.klijent@jatomogu.rs',
      guestPhone: '+381661234567',
      hasViber: true,
      hasWhatsApp: false,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking11.id,
      userId: client2.id,
      amount: 23100,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'cash',
    },
  });

  // 12. Confirmed BONUS booking for client1, guide2 — arriving in 5 days, Nikiti
  const future5 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const booking12 = await prisma.booking.create({
    data: {
      userId: client1.id,
      accommodationId: accommodation3.id,
      guideId: guide2.id,
      arrivalDate: future5,
      arrivalTime: '15:00',
      duration: 'FOUR_SEVEN',
      packageType: 'BONUS',
      totalPrice: 35000,
      status: 'CONFIRMED',
      journeyStatus: 'NOT_STARTED',
      expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      guestName: 'Petar Klijent',
      guestEmail: 'klijent@jatomogu.rs',
      guestPhone: '+381651234567',
      hasViber: true,
      hasWhatsApp: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking12.id,
      userId: client1.id,
      amount: 35000,
      currency: 'RSD',
      status: 'PENDING',
      paymentMethod: 'bank_transfer',
    },
  });

  // 13. Confirmed BONUS booking for client2, guide2 — arriving today, Paralija (for today's clients)
  const todayDate2 = new Date();
  todayDate2.setHours(18, 0, 0, 0);
  const booking13 = await prisma.booking.create({
    data: {
      userId: client2.id,
      accommodationId: accommodation4.id,
      guideId: guide2.id,
      arrivalDate: todayDate2,
      arrivalTime: '18:00',
      duration: 'EIGHT_TEN',
      packageType: 'BONUS',
      totalPrice: 47500,
      status: 'CONFIRMED',
      journeyStatus: 'IN_GREECE',
      departedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      arrivedGreeceAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      guestName: 'Milica Klijent',
      guestEmail: 'milica.klijent@jatomogu.rs',
      guestPhone: '+381661234567',
      hasViber: false,
      hasWhatsApp: true,
    },
  });
  await prisma.payment.create({
    data: {
      bookingId: booking13.id,
      userId: client2.id,
      amount: 47500,
      currency: 'RSD',
      status: 'COMPLETED',
      paymentMethod: 'bank_transfer',
    },
  });

  // Update booked accommodations
  await prisma.accommodation.update({
    where: { id: accommodation3.id },
    data: { status: 'BOOKED' },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking9.id,
      userId: client2.id,
      amount: 11250,
      currency: 'RSD',
      status: 'PENDING',
      paymentMethod: 'cash',
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
