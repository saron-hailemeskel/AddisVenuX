const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting AddisVenuX database seed...");

  // 1. Clean existing records in reverse dependency order
  await prisma.ticket.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.ticketTier.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash passwords
  const passwordAdmin = await bcrypt.hash("Admin1234!", 10);
  const passwordOrganizer = await bcrypt.hash("Organizer1234!", 10);
  const passwordStaff = await bcrypt.hash("Staff1234!", 10);
  const passwordCustomer = await bcrypt.hash("Customer1234!", 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@addisvenux.et",
      passwordHash: passwordAdmin,
      fullName: "AddisVenuX Admin",
      phoneNumber: "+251911000001",
      role: "PLATFORM_ADMIN",
    },
  });

  const organizerOwner = await prisma.user.create({
    data: {
      email: "saron@addistech.et",
      passwordHash: passwordOrganizer,
      fullName: "Saron Hailemeskel",
      phoneNumber: "+251911000002",
      role: "USER",
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: "abel@addistech.et",
      passwordHash: passwordStaff,
      fullName: "Abel Kebede",
      phoneNumber: "+251911000003",
      role: "USER",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: "kal@gmail.com",
      passwordHash: passwordCustomer,
      fullName: "Kalkidan Tesfaye",
      phoneNumber: "+251911000004",
      role: "USER",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: "selam@gmail.com",
      passwordHash: passwordCustomer,
      fullName: "Selamawit Bekele",
      phoneNumber: "+251911000005",
      role: "USER",
    },
  });

  console.log("✅ Seeded Users (Admin, Organizer, Staff, Customers)");

  // 4. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Addis Tech Events",
      slug: "addis-tech-events",
      description: "Premier technology, innovation, and startup event organizer in Ethiopia.",
      email: "contact@addistech.et",
      phoneNumber: "+251911000002",
    },
  });

  // 5. Add Organization Members
  await prisma.organizationMember.createMany({
    data: [
      {
        organizationId: org.id,
        userId: organizerOwner.id,
        role: "OWNER",
      },
      {
        organizationId: org.id,
        userId: staffUser.id,
        role: "STAFF",
      },
    ],
  });

  console.log("✅ Seeded Organization & Members");

  // 6. Create Events & Ticket Tiers
  const now = new Date();
  const event1Date = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days later
  const event1EndDate = new Date(event1Date.getTime() + 8 * 60 * 60 * 1000); // 8 hours duration

  const event1 = await prisma.event.create({
    data: {
      organizationId: org.id,
      title: "Addis Tech Summit 2026",
      slug: "addis-tech-summit-2026",
      description: "Ethiopia's largest annual gathering of tech founders, developers, creators, and investors.",
      category: "TECH",
      venueName: "Millennium Hall",
      address: "Bole Sub-City, Next to Addis Ababa Airport",
      city: "Addis Ababa",
      startDateTime: event1Date,
      endDateTime: event1EndDate,
      status: "PUBLISHED",
      ticketTiers: {
        create: [
          {
            name: "Early Bird",
            description: "Limited discount tickets for early registrants.",
            price: 500.0,
            totalCapacity: 100,
            availableCapacity: 100,
            maxPerOrder: 5,
            status: "ACTIVE",
          },
          {
            name: "Regular Attendee",
            description: "Full access to keynotes, panel tracks, and tech exhibitions.",
            price: 800.0,
            totalCapacity: 500,
            availableCapacity: 500,
            maxPerOrder: 10,
            status: "ACTIVE",
          },
          {
            name: "VIP Pass",
            description: "Access to VIP lounge, speaker dinner, and priority front-row seating.",
            price: 1500.0,
            totalCapacity: 50,
            availableCapacity: 50,
            maxPerOrder: 3,
            status: "ACTIVE",
          },
        ],
      },
    },
  });

  const event2Date = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // 21 days later
  const event2EndDate = new Date(event2Date.getTime() + 10 * 60 * 60 * 1000);

  const event2 = await prisma.event.create({
    data: {
      organizationId: org.id,
      title: "Addis Cultural & Music Festival",
      slug: "addis-cultural-music-festival",
      description: "A celebration of Ethiopian music, cuisine, art, and traditional culture in the heart of Addis Ababa.",
      category: "CULTURE",
      venueName: "Ghion Hotel Gardens",
      address: "Ras Desta Damtew St",
      city: "Addis Ababa",
      startDateTime: event2Date,
      endDateTime: event2EndDate,
      status: "PUBLISHED",
      ticketTiers: {
        create: [
          {
            name: "General Admission",
            description: "Standard entry to all concert stages and cultural exhibitions.",
            price: 350.0,
            totalCapacity: 800,
            availableCapacity: 800,
            maxPerOrder: 8,
            status: "ACTIVE",
          },
          {
            name: "VIP Table Area",
            description: "Covered seating area with dedicated food and beverage service.",
            price: 1000.0,
            totalCapacity: 100,
            availableCapacity: 100,
            maxPerOrder: 4,
            status: "ACTIVE",
          },
        ],
      },
    },
  });

  console.log("✅ Seeded Events & Ticket Tiers (Addis Tech Summit & Cultural Music Festival)");
  console.log("🎉 AddisVenuX database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
