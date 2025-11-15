import { PrismaClient, Role, PrayerType, AssetType, FeedbackStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (optional - comment out if you want to preserve data)
  await prisma.reaction.deleteMany();
  await prisma.recipeRating.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.kidsAsset.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.prayer.deleteMany();
  await prisma.rSVP.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSettings.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create regular members
  const memberPassword = await hash('member123', 12);
  const members = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: memberPassword,
        role: Role.MEMBER,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: memberPassword,
        role: Role.MEMBER,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: memberPassword,
        role: Role.MEMBER,
        emailVerified: new Date(),
      },
    }),
  ]);

  console.log('✅ Created member users');

  // Create events
  const now = new Date();
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Sunday Service',
        description: 'Weekly worship service with praise, teaching, and fellowship.',
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0),
        endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 12, 0),
        location: 'Main Sanctuary',
        isPotluck: false,
        capacity: 200,
        tags: ['worship', 'service'],
        createdById: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Community Potluck',
        description: 'Bring your favorite dish and join us for a time of fellowship and sharing.',
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 18, 0),
        endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 21, 0),
        location: 'Fellowship Hall',
        isPotluck: true,
        capacity: 100,
        tags: ['fellowship', 'potluck', 'community'],
        createdById: admin.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Bible Study',
        description: 'Weekly study of the Gospel of John. All are welcome!',
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 19, 0),
        endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 20, 30),
        location: 'Room 205',
        isPotluck: false,
        tags: ['bible-study', 'learning'],
        createdById: members[0].id,
      },
    }),
  ]);

  console.log('✅ Created events');

  // Create RSVPs
  await Promise.all([
    prisma.rSVP.create({
      data: {
        eventId: events[0].id,
        userId: members[0].id,
        adults: 2,
        kids: 1,
      },
    }),
    prisma.rSVP.create({
      data: {
        eventId: events[0].id,
        userId: members[1].id,
        adults: 1,
        kids: 0,
      },
    }),
    prisma.rSVP.create({
      data: {
        eventId: events[1].id,
        userId: members[0].id,
        adults: 2,
        kids: 2,
        note: "Bringing lasagna!",
      },
    }),
  ]);

  console.log('✅ Created RSVPs');

  // Create prayers
  const prayers = await Promise.all([
    prisma.prayer.create({
      data: {
        title: 'Healing for my mother',
        body: 'Please pray for my mother who is recovering from surgery. We trust in God\'s healing power.',
        type: PrayerType.REQUEST,
        authorId: members[0].id,
        isApproved: true,
        reactionsCount: 5,
      },
    }),
    prisma.prayer.create({
      data: {
        title: 'Praise for new job!',
        body: 'Thank you all for your prayers! I got the job I interviewed for. God is faithful!',
        type: PrayerType.PRAISE,
        authorId: members[1].id,
        isApproved: true,
        reactionsCount: 12,
      },
    }),
    prisma.prayer.create({
      data: {
        title: 'Prayer for guidance',
        body: 'Seeking God\'s wisdom for an important decision. Please pray for clarity and peace.',
        type: PrayerType.REQUEST,
        isAnonymous: true,
        isApproved: true,
        reactionsCount: 3,
      },
    }),
  ]);

  console.log('✅ Created prayers');

  // Create reflections
  await Promise.all([
    prisma.reflection.create({
      data: {
        title: 'God\'s Grace in Difficult Times',
        body: 'This week I\'ve been reflecting on how God\'s grace sustains us even in the hardest moments. When I felt overwhelmed, He reminded me that His strength is made perfect in weakness.',
        tags: ['grace', 'faith', 'perseverance'],
        authorId: members[0].id,
        isApproved: true,
      },
    }),
    prisma.reflection.create({
      data: {
        title: 'Learning to Trust',
        body: 'Through recent challenges, God has been teaching me to truly trust Him rather than relying on my own understanding. It\'s not easy, but I\'m seeing His faithfulness in new ways.',
        tags: ['trust', 'faith', 'growth'],
        authorId: members[1].id,
        isApproved: true,
      },
    }),
  ]);

  console.log('✅ Created reflections');

  // Create recipes
  const recipes = await Promise.all([
    prisma.recipe.create({
      data: {
        title: 'Famous Chocolate Chip Cookies',
        ingredients: '2 cups flour\n1 cup butter\n1 cup sugar\n2 eggs\n2 cups chocolate chips\n1 tsp vanilla\n1 tsp baking soda\n1/2 tsp salt',
        steps: '1. Preheat oven to 375°F\n2. Cream butter and sugar\n3. Add eggs and vanilla\n4. Mix in dry ingredients\n5. Fold in chocolate chips\n6. Bake for 10-12 minutes',
        categories: ['dessert', 'cookies'],
        isPotluckHit: true,
        authorId: members[1].id,
        ratingAvg: 4.8,
        ratingCount: 15,
      },
    }),
    prisma.recipe.create({
      data: {
        title: 'Classic Lasagna',
        ingredients: '1 lb ground beef\n1 box lasagna noodles\n4 cups mozzarella\n2 cups ricotta\n1 jar marinara sauce\nItalian seasoning',
        steps: '1. Cook noodles\n2. Brown beef with seasoning\n3. Layer noodles, beef, cheeses, sauce\n4. Repeat layers\n5. Bake at 375°F for 45 minutes',
        categories: ['main-dish', 'italian'],
        isPotluckHit: true,
        authorId: members[0].id,
        ratingAvg: 4.9,
        ratingCount: 22,
      },
    }),
  ]);

  console.log('✅ Created recipes');

  // Create playlists
  await Promise.all([
    prisma.playlist.create({
      data: {
        title: 'Sunday Worship Songs',
        youtubeUrl: 'https://www.youtube.com/playlist?list=PLp4z5DYR2xtYt8MQC2XTOBgAh8PL9LRgZ',
        description: 'Our favorite worship songs for Sunday services',
        isPublic: true,
        sortOrder: 1,
      },
    }),
    prisma.playlist.create({
      data: {
        title: 'Contemporary Christian',
        youtubeUrl: 'https://www.youtube.com/playlist?list=PLp4z5DYR2xtYBq4E3B3KnQbL0zqg7V9xM',
        description: 'Contemporary Christian music playlist',
        isPublic: true,
        sortOrder: 2,
      },
    }),
  ]);

  console.log('✅ Created playlists');

  // Create kids assets
  await Promise.all([
    prisma.kidsAsset.create({
      data: {
        title: 'John 3:16 Memory Verse Card',
        description: 'Beautiful memory verse card for kids to learn John 3:16',
        type: AssetType.VERSE,
        fileUrl: 'https://example.com/verse-john-3-16.pdf',
        thumbnailUrl: 'https://example.com/verse-john-3-16-thumb.jpg',
        tags: ['memory-verse', 'john'],
      },
    }),
    prisma.kidsAsset.create({
      data: {
        title: 'Noah\'s Ark Coloring Page',
        description: 'Fun coloring page featuring Noah\'s Ark',
        type: AssetType.COLORING,
        fileUrl: 'https://example.com/noahs-ark-coloring.pdf',
        tags: ['coloring', 'noah', 'old-testament'],
      },
    }),
    prisma.kidsAsset.create({
      data: {
        title: 'Fruits of the Spirit Worksheet',
        description: 'Interactive worksheet to learn about the Fruits of the Spirit',
        type: AssetType.ACTIVITY,
        fileUrl: 'https://example.com/fruits-of-spirit-activity.pdf',
        tags: ['activity', 'fruits-of-spirit'],
      },
    }),
  ]);

  console.log('✅ Created kids assets');

  // Create feedback
  await prisma.feedback.create({
    data: {
      userId: members[0].id,
      category: 'Website',
      message: 'The new website looks great! It\'s much easier to navigate now.',
      status: FeedbackStatus.NEW,
    },
  });

  console.log('✅ Created feedback');

  // Create site settings
  await prisma.siteSettings.create({
    data: {
      id: 'default',
      siteName: 'Church Friends',
      primaryColor: '#0ea5e9',
      allowAnonymousPrayer: true,
      requireModeration: false, // Set to false for easier dev
      maxRsvpAdults: 10,
      maxRsvpKids: 10,
    },
  });

  console.log('✅ Created site settings');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Login credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Member: john@example.com / member123');
  console.log('   Member: jane@example.com / member123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
