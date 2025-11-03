-- Seed Bible Verses for Memory Game
-- Run this in Supabase SQL Editor after running the migration

INSERT INTO "BibleVerse" ("id", "reference", "text", "category", "popularity", "createdAt", "updatedAt") VALUES
('verse1', 'John 3:16', 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', 'Love', 100, NOW(), NOW()),
('verse2', 'Philippians 4:13', 'I can do all this through him who gives me strength.', 'Strength', 98, NOW(), NOW()),
('verse3', 'Jeremiah 29:11', 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 'Hope', 97, NOW(), NOW()),
('verse4', 'Psalm 23:1', 'The Lord is my shepherd, I lack nothing.', 'Comfort', 96, NOW(), NOW()),
('verse5', 'Proverbs 3:5-6', 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', 'Trust', 95, NOW(), NOW()),
('verse6', 'Romans 8:28', 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', 'Faith', 94, NOW(), NOW()),
('verse7', 'Isaiah 41:10', 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.', 'Courage', 93, NOW(), NOW()),
('verse8', 'Matthew 11:28', 'Come to me, all you who are weary and burdened, and I will give you rest.', 'Rest', 92, NOW(), NOW()),
('verse9', 'Joshua 1:9', 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', 'Courage', 91, NOW(), NOW()),
('verse10', 'Psalm 46:1', 'God is our refuge and strength, an ever-present help in trouble.', 'Strength', 90, NOW(), NOW()),
('verse11', 'Romans 12:2', 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God''s will is—his good, pleasing and perfect will.', 'Transformation', 89, NOW(), NOW()),
('verse12', 'Ephesians 2:8-9', 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God— not by works, so that no one can boast.', 'Grace', 88, NOW(), NOW()),
('verse13', 'Psalm 119:105', 'Your word is a lamp for my feet, a light on my path.', 'Guidance', 87, NOW(), NOW()),
('verse14', '1 Corinthians 13:4-5', 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.', 'Love', 86, NOW(), NOW()),
('verse15', 'Matthew 6:33', 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.', 'Priorities', 85, NOW(), NOW()),
('verse16', '2 Timothy 1:7', 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.', 'Power', 84, NOW(), NOW()),
('verse17', 'Psalm 27:1', 'The Lord is my light and my salvation— whom shall I fear? The Lord is the stronghold of my life— of whom shall I be afraid?', 'Courage', 83, NOW(), NOW()),
('verse18', 'Galatians 5:22-23', 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.', 'Character', 82, NOW(), NOW()),
('verse19', 'Hebrews 11:1', 'Now faith is confidence in what we hope for and assurance about what we do not see.', 'Faith', 81, NOW(), NOW()),
('verse20', 'James 1:2-3', 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.', 'Perseverance', 80, NOW(), NOW()),
('verse21', '1 John 4:19', 'We love because he first loved us.', 'Love', 79, NOW(), NOW()),
('verse22', 'Matthew 5:16', 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.', 'Witness', 78, NOW(), NOW()),
('verse23', 'Colossians 3:23', 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.', 'Work', 77, NOW(), NOW()),
('verse24', 'Proverbs 16:3', 'Commit to the Lord whatever you do, and he will establish your plans.', 'Planning', 76, NOW(), NOW()),
('verse25', 'Psalm 37:4', 'Take delight in the Lord, and he will give you the desires of your heart.', 'Delight', 75, NOW(), NOW())
ON CONFLICT ("reference") DO NOTHING;
