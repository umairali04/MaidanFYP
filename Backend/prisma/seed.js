import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {

  // ============================================
  // USERS
  // ============================================

  const hashedPassword = await bcrypt.hash('password123', 10)

  const player1 = await prisma.user.create({
    data: {
      name:       'Ali Khan',
      email:      'ali@test.com',
      password:   hashedPassword,
      phone:      '03001234567',
      role:       'PLAYER',
      isVerified: true,
      image:      'https://randomuser.me/api/portraits/men/1.jpg',
    }
  })

  const player2 = await prisma.user.create({
    data: {
      name:       'Sara Ahmed',
      email:      'sara@test.com',
      password:   hashedPassword,
      phone:      '03111234567',
      role:       'PLAYER',
      isVerified: true,
      image:      'https://randomuser.me/api/portraits/women/2.jpg',
    }
  })

  const owner1 = await prisma.user.create({
    data: {
      name:       'Usman Malik',
      email:      'usman@test.com',
      password:   hashedPassword,
      phone:      '03211234567',
      role:       'GROUND_OWNER',
      isVerified: true,
      image:      'https://randomuser.me/api/portraits/men/3.jpg',
    }
  })

  const owner2 = await prisma.user.create({
    data: {
      name:       'Bilal Raza',
      email:      'bilal@test.com',
      password:   hashedPassword,
      phone:      '03311234567',
      role:       'GROUND_OWNER',
      isVerified: true,
      image:      'https://randomuser.me/api/portraits/men/4.jpg',
    }
  })

  // ============================================
  // GROUNDS
  // ============================================

  const ground1 = await prisma.ground.create({
    data: {
      name:         'Champions Futsal Arena',
      description:  'Premium indoor futsal ground with FIFA quality turf and floodlights.',
      sportType:    'FOOTBALL',
      location:     'Blue Area, Islamabad',
      city:         'Islamabad',
      latitude:     33.7215,
      longitude:    73.0433,
      pricePerHour: 2500,
      images:       [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6',
        'https://images.unsplash.com/photo-1551958219-acbc595d9e8d',
      ],
      facilities:   ['Parking', 'Changing Room', 'Floodlights', 'Cafeteria'],
      openTime:     '06:00',
      closeTime:    '23:00',
      slotDuration: 60,
      isActive:     true,
      ownerId:      owner1.id,
    }
  })

  const ground2 = await prisma.ground.create({
    data: {
      name:         'Green Valley Cricket Ground',
      description:  'Full size outdoor cricket ground with proper pitch and pavilion.',
      sportType:    'CRICKET',
      location:     'DHA Phase 2, Lahore',
      city:         'Lahore',
      latitude:     31.4697,
      longitude:    74.4072,
      pricePerHour: 3000,
      images:       [
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
        'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972',
      ],
      facilities:   ['Parking', 'Pavilion', 'Equipment Rental', 'Scoreboard'],
      openTime:     '07:00',
      closeTime:    '22:00',
      slotDuration: 120,
      isActive:     true,
      ownerId:      owner1.id,
    }
  })

  const ground3 = await prisma.ground.create({
    data: {
      name:         'Elite Padel Club',
      description:  'Modern glass padel courts with professional coaching available.',
      sportType:    'TENNIS',
      location:     'Clifton Block 5, Karachi',
      city:         'Karachi',
      latitude:     24.8138,
      longitude:    67.0300,
      pricePerHour: 4000,
      images:       [
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8',
        'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0',
      ],
      facilities:   ['Parking', 'Shower', 'Coaching', 'Pro Shop'],
      openTime:     '08:00',
      closeTime:    '22:00',
      slotDuration: 60,
      isActive:     true,
      ownerId:      owner2.id,
    }
  })

  const ground4 = await prisma.ground.create({
    data: {
      name:         'Smash Badminton Hall',
      description:  'Indoor air-conditioned badminton courts with wooden flooring.',
      sportType:    'BADMINTON',
      location:     'Gulberg III, Lahore',
      city:         'Lahore',
      latitude:     31.5120,
      longitude:    74.3587,
      pricePerHour: 1500,
      images:       [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
        'https://images.unsplash.com/photo-1613918108466-292b78a8ef35',
      ],
      facilities:   ['AC', 'Parking', 'Equipment Rental', 'Cafeteria'],
      openTime:     '06:00',
      closeTime:    '23:00',
      slotDuration: 60,
      isActive:     true,
      ownerId:      owner2.id,
    }
  })

  const ground5 = await prisma.ground.create({
    data: {
      name:         'Smash Badminton Hall',
      description:  'Indoor air-conditioned badminton courts with wooden flooring.',
      sportType:    'FOOTBALL',
      location:     'Gulberg III, Lahore',
      city:         'Lahore',
      latitude:     31.5120,
      longitude:    74.3587,
      pricePerHour: 1500,
      images:       [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
        'https://images.unsplash.com/photo-1613918108466-292b78a8ef35',
      ],
      facilities:   ['AC', 'Parking', 'Equipment Rental', 'Cafeteria'],
      openTime:     '06:00',
      closeTime:    '23:00',
      slotDuration: 60,
      isActive:     true,
      ownerId:      owner2.id,
    }
  })

  const ground6 = await prisma.ground.create({
    data: {
      name:         'Smash Badminton Hall',
      description:  'Indoor air-conditioned badminton courts with wooden flooring.',
      sportType:    'FOOTBALL',
      location:     'Gulberg III, karachi',
      city:         'Karachi',
      latitude:     31.5120,
      longitude:    74.3587,
      pricePerHour: 1500,
      images:       [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea',
        'https://images.unsplash.com/photo-1613918108466-292b78a8ef35',
      ],
      facilities:   ['AC', 'Parking', 'Equipment Rental', 'Cafeteria'],
      openTime:     '06:00',
      closeTime:    '23:00',
      slotDuration: 60,
      isActive:     true,
      ownerId:      owner2.id,
    }
  })

  // ============================================
  // BLOCKED SLOTS
  // ============================================

  await prisma.blockedSlot.create({
    data: {
      groundId:  ground1.id,
      date:      new Date('2025-07-20'),
      startTime: '06:00',
      endTime:   '23:00',
      reason:    'Maintenance day',
      isFullDay: true,
    }
  })

  await prisma.blockedSlot.create({
    data: {
      groundId:  ground2.id,
      date:      new Date('2025-07-22'),
      startTime: '10:00',
      endTime:   '14:00',
      reason:    'Private event',
      isFullDay: false,
    }
  })

  // ============================================
  // BOOKINGS
  // ============================================

  const booking1 = await prisma.booking.create({
    data: {
      userId:      player1.id,
      groundId:    ground1.id,
      bookingDate: new Date('2025-07-15'),
      startTime:   '10:00',
      endTime:     '12:00',
      duration:    2,
      totalPrice:  5000,
      status:      'CONFIRMED',
      notes:       'Need extra balls please',
    }
  })

  const booking2 = await prisma.booking.create({
    data: {
      userId:      player2.id,
      groundId:    ground2.id,
      bookingDate: new Date('2025-07-16'),
      startTime:   '08:00',
      endTime:     '10:00',
      duration:    2,
      totalPrice:  6000,
      status:      'PENDING',
    }
  })

  const booking3 = await prisma.booking.create({
    data: {
      userId:      player1.id,
      groundId:    ground3.id,
      bookingDate: new Date('2025-07-18'),
      startTime:   '17:00',
      endTime:     '18:00',
      duration:    1,
      totalPrice:  4000,
      status:      'COMPLETED',
    }
  })

  const booking4 = await prisma.booking.create({
    data: {
      userId:      player2.id,
      groundId:    ground4.id,
      bookingDate: new Date('2025-07-19'),
      startTime:   '09:00',
      endTime:     '10:00',
      duration:    1,
      totalPrice:  1500,
      status:      'CANCELLED',
    }
  })

  // ============================================
  // PAYMENTS
  // ============================================

  await prisma.payment.create({
    data: {
      bookingId:     booking1.id,
      amount:        5000,
      paymentStatus: 'SUCCESS',
      transactionId: 'TXN-001-2025',
      method:        'JazzCash',
      paidAt:        new Date('2025-07-15T09:00:00Z'),
    }
  })

  await prisma.payment.create({
    data: {
      bookingId:     booking2.id,
      amount:        6000,
      paymentStatus: 'PENDING',
      method:        'EasyPaisa',
    }
  })

  await prisma.payment.create({
    data: {
      bookingId:     booking3.id,
      amount:        4000,
      paymentStatus: 'SUCCESS',
      transactionId: 'TXN-003-2025',
      method:        'Card',
      paidAt:        new Date('2025-07-18T16:00:00Z'),
    }
  })

  await prisma.payment.create({
    data: {
      bookingId:     booking4.id,
      amount:        1500,
      paymentStatus: 'REFUNDED',
      transactionId: 'TXN-004-2025',
      method:        'Cash',
      paidAt:        new Date('2025-07-19T08:00:00Z'),
    }
  })

  // ============================================
  // REVIEWS
  // ============================================

  await prisma.review.create({
    data: {
      userId:   player1.id,
      groundId: ground1.id,
      rating:   5,
      comment:  'Amazing turf quality! Will definitely book again.',
    }
  })

  await prisma.review.create({
    data: {
      userId:   player2.id,
      groundId: ground2.id,
      rating:   4,
      comment:  'Great ground but parking could be better.',
    }
  })

  await prisma.review.create({
    data: {
      userId:   player1.id,
      groundId: ground3.id,
      rating:   5,
      comment:  'Best padel court in Karachi. Very professional staff.',
    }
  })

  await prisma.review.create({
    data: {
      userId:   player2.id,
      groundId: ground4.id,
      rating:   3,
      comment:  'Good courts but AC was not working properly.',
    }
  })

  // ============================================
  // REVENUE REPORTS
  // ============================================

  await prisma.revenueReport.create({
    data: {
      groundId:      ground1.id,
      ownerId:       owner1.id,
      month:         6,
      year:          2025,
      totalBookings: 45,
      totalRevenue:  112500,
    }
  })

  await prisma.revenueReport.create({
    data: {
      groundId:      ground2.id,
      ownerId:       owner1.id,
      month:         6,
      year:          2025,
      totalBookings: 30,
      totalRevenue:  90000,
    }
  })

  await prisma.revenueReport.create({
    data: {
      groundId:      ground3.id,
      ownerId:       owner2.id,
      month:         6,
      year:          2025,
      totalBookings: 60,
      totalRevenue:  240000,
    }
  })

  // ============================================
  // NOTIFICATIONS
  // ============================================

  await prisma.notification.create({
    data: {
      userId:  player1.id,
      title:   'Booking Confirmed!',
      message: 'Your booking at Champions Futsal Arena on July 15 is confirmed.',
      isRead:  false,
      type:    'BOOKING',
    }
  })

  await prisma.notification.create({
    data: {
      userId:  player2.id,
      title:   'Payment Pending',
      message: 'Your payment for Green Valley Cricket Ground is still pending.',
      isRead:  false,
      type:    'PAYMENT',
    }
  })

  await prisma.notification.create({
    data: {
      userId:  owner1.id,
      title:   'New Booking Received',
      message: 'Ali Khan has booked Champions Futsal Arena for July 15.',
      isRead:  true,
      type:    'BOOKING',
    }
  })

  console.log('✅ Seed data inserted successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })