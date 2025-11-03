import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const popularVerses = [
  // Most popular verses (popularity 100-90)
  {
    reference: 'John 3:16',
    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    category: 'Love',
    popularity: 100,
  },
  {
    reference: 'Philippians 4:13',
    text: 'I can do all this through him who gives me strength.',
    category: 'Strength',
    popularity: 98,
  },
  {
    reference: 'Jeremiah 29:11',
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    category: 'Hope',
    popularity: 97,
  },
  {
    reference: 'Psalm 23:1',
    text: 'The Lord is my shepherd, I lack nothing.',
    category: 'Comfort',
    popularity: 96,
  },
  {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    category: 'Trust',
    popularity: 95,
  },
  {
    reference: 'Romans 8:28',
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    category: 'Faith',
    popularity: 94,
  },
  {
    reference: 'Isaiah 41:10',
    text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    category: 'Courage',
    popularity: 93,
  },
  {
    reference: 'Matthew 11:28',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    category: 'Rest',
    popularity: 92,
  },
  {
    reference: 'Joshua 1:9',
    text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    category: 'Courage',
    popularity: 91,
  },
  {
    reference: 'Psalm 46:1',
    text: 'God is our refuge and strength, an ever-present help in trouble.',
    category: 'Strength',
    popularity: 90,
  },

  // Very popular verses (popularity 89-80)
  {
    reference: 'Romans 12:2',
    text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is—his good, pleasing and perfect will.',
    category: 'Transformation',
    popularity: 89,
  },
  {
    reference: 'Ephesians 2:8-9',
    text: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God— not by works, so that no one can boast.',
    category: 'Grace',
    popularity: 88,
  },
  {
    reference: 'Psalm 119:105',
    text: 'Your word is a lamp for my feet, a light on my path.',
    category: 'Guidance',
    popularity: 87,
  },
  {
    reference: '1 Corinthians 13:4-5',
    text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.',
    category: 'Love',
    popularity: 86,
  },
  {
    reference: 'Matthew 6:33',
    text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    category: 'Priorities',
    popularity: 85,
  },
  {
    reference: '2 Timothy 1:7',
    text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    category: 'Power',
    popularity: 84,
  },
  {
    reference: 'Psalm 27:1',
    text: 'The Lord is my light and my salvation— whom shall I fear? The Lord is the stronghold of my life— of whom shall I be afraid?',
    category: 'Courage',
    popularity: 83,
  },
  {
    reference: 'Galatians 5:22-23',
    text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.',
    category: 'Character',
    popularity: 82,
  },
  {
    reference: 'Hebrews 11:1',
    text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
    category: 'Faith',
    popularity: 81,
  },
  {
    reference: 'James 1:2-3',
    text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.',
    category: 'Perseverance',
    popularity: 80,
  },

  // Popular verses (popularity 79-70)
  {
    reference: '1 John 4:19',
    text: 'We love because he first loved us.',
    category: 'Love',
    popularity: 79,
  },
  {
    reference: 'Matthew 5:16',
    text: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.',
    category: 'Witness',
    popularity: 78,
  },
  {
    reference: 'Colossians 3:23',
    text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
    category: 'Work',
    popularity: 77,
  },
  {
    reference: 'Proverbs 16:3',
    text: 'Commit to the Lord whatever you do, and he will establish your plans.',
    category: 'Planning',
    popularity: 76,
  },
  {
    reference: 'Psalm 37:4',
    text: 'Take delight in the Lord, and he will give you the desires of your heart.',
    category: 'Delight',
    popularity: 75,
  },
];

async function seedVerses() {
  console.log('Seeding Bible verses...');

  for (const verse of popularVerses) {
    await prisma.bibleVerse.upsert({
      where: { reference: verse.reference },
      update: verse,
      create: verse,
    });
  }

  console.log(`✓ Seeded ${popularVerses.length} Bible verses`);
}

seedVerses()
  .catch((e) => {
    console.error('Error seeding verses:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
