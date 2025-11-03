-- Delete existing verses and add kid-friendly verses
-- Run this in Supabase SQL Editor to replace with kid-appropriate verses

-- Clear existing verses
DELETE FROM "BibleVerse";

-- Insert kid-friendly Bible verses (ages 3-12)
INSERT INTO "BibleVerse" ("id", "reference", "text", "category", "popularity", "createdAt", "updatedAt") VALUES

-- Simple, short verses for younger kids (ages 3-6)
('verse1', 'Psalm 136:1', 'Give thanks to the Lord, for he is good!', 'Thankfulness', 100, NOW(), NOW()),
('verse2', '1 John 4:19', 'We love because he first loved us.', 'Love', 99, NOW(), NOW()),
('verse3', 'Psalm 118:24', 'This is the day the Lord has made. Let us rejoice and be glad in it.', 'Joy', 98, NOW(), NOW()),
('verse4', 'Proverbs 3:5', 'Trust in the Lord with all your heart.', 'Trust', 97, NOW(), NOW()),
('verse5', 'Psalm 56:3', 'When I am afraid, I put my trust in you.', 'Trust', 96, NOW(), NOW()),

-- Medium verses for elementary age (ages 7-9)
('verse6', 'Joshua 1:9', 'Be strong and courageous! Do not be afraid.', 'Courage', 95, NOW(), NOW()),
('verse7', 'Philippians 4:4', 'Rejoice in the Lord always. I will say it again: Rejoice!', 'Joy', 94, NOW(), NOW()),
('verse8', 'Ephesians 4:32', 'Be kind and loving to each other.', 'Kindness', 93, NOW(), NOW()),
('verse9', 'Proverbs 17:17', 'A friend loves at all times.', 'Friendship', 92, NOW(), NOW()),
('verse10', 'Psalm 119:105', 'Your word is a lamp to guide my feet.', 'Guidance', 91, NOW(), NOW()),

-- Slightly longer verses for older kids (ages 10-12)
('verse11', 'Jeremiah 29:11', 'I know the plans I have for you, says the Lord. Plans to give you hope and a future.', 'Hope', 90, NOW(), NOW()),
('verse12', 'Matthew 5:16', 'Let your light shine before others, that they may see your good deeds.', 'Light', 89, NOW(), NOW()),
('verse13', 'Psalm 23:1', 'The Lord is my shepherd, I have all that I need.', 'Trust', 88, NOW(), NOW()),
('verse14', 'Philippians 4:13', 'I can do all things through Christ who gives me strength.', 'Strength', 87, NOW(), NOW()),
('verse15', 'Proverbs 3:6', 'In all your ways remember him, and he will guide you.', 'Guidance', 86, NOW(), NOW()),

-- Action-oriented verses kids can apply
('verse16', 'Colossians 3:23', 'Work at everything you do with all your heart.', 'Work', 85, NOW(), NOW()),
('verse17', 'Galatians 6:9', 'Let us not become tired of doing good.', 'Perseverance', 84, NOW(), NOW()),
('verse18', 'Psalm 100:1', 'Shout for joy to the Lord, all the earth!', 'Praise', 83, NOW(), NOW()),
('verse19', '1 Thessalonians 5:16', 'Rejoice always!', 'Joy', 82, NOW(), NOW()),
('verse20', 'Hebrews 13:16', 'Do not forget to do good and to share with others.', 'Sharing', 81, NOW(), NOW()),

-- Character-building verses
('verse21', 'Colossians 3:12', 'Be kind, humble, gentle and patient.', 'Character', 80, NOW(), NOW()),
('verse22', 'Proverbs 15:1', 'A gentle answer turns away anger.', 'Peace', 79, NOW(), NOW()),
('verse23', 'Matthew 22:39', 'Love your neighbor as yourself.', 'Love', 78, NOW(), NOW()),
('verse24', 'Psalm 34:14', 'Turn from evil and do good. Seek peace.', 'Peace', 77, NOW(), NOW()),
('verse25', 'John 15:12', 'Love each other as I have loved you.', 'Love', 76, NOW(), NOW())

ON CONFLICT ("reference") DO UPDATE SET
  "text" = EXCLUDED."text",
  "category" = EXCLUDED."category",
  "popularity" = EXCLUDED."popularity",
  "updatedAt" = NOW();
