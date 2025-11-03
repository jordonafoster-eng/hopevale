'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SparklesIcon, TrophyIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';

type Verse = {
  id: string;
  reference: string;
  text: string;
  category: string | null;
};

type Card = {
  id: string;
  verseId: string;
  content: string;
  type: 'reference' | 'text';
  isMatched: boolean;
};

const encouragements = [
  "Great job! 🌟",
  "You're doing awesome! ⭐",
  "Keep going! 💪",
  "Amazing! 🎉",
  "Super match! 🌈",
  "Wonderful! ✨",
  "You're a star! ⭐",
  "Fantastic! 🎊",
];

const colors = [
  'bg-pink-400 hover:bg-pink-500 border-pink-500',
  'bg-purple-400 hover:bg-purple-500 border-purple-500',
  'bg-blue-400 hover:bg-blue-500 border-blue-500',
  'bg-green-400 hover:bg-green-500 border-green-500',
  'bg-yellow-400 hover:bg-yellow-500 border-yellow-500',
  'bg-orange-400 hover:bg-orange-500 border-orange-500',
];

export function VerseMatchingGame() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kids/verse-game?count=5');
      if (!response.ok) throw new Error('Failed to load verses');

      const data = await response.json();
      setVerses(data);
      initializeCards(data);
      setStartTime(Date.now());
    } catch (error) {
      toast.error('Oops! Try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCards = (verses: Verse[]) => {
    const newCards: Card[] = [];
    const newColorMap: Record<string, string> = {};

    verses.forEach((verse, index) => {
      const color = colors[index % colors.length];
      newColorMap[verse.id] = color;

      newCards.push({
        id: `ref-${verse.id}`,
        verseId: verse.id,
        content: verse.reference,
        type: 'reference',
        isMatched: false,
      });
      newCards.push({
        id: `text-${verse.id}`,
        verseId: verse.id,
        content: verse.text,
        type: 'text',
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setColorMap(newColorMap);
    setSelectedCards([]);
    setMatchedPairs([]);
    setGameComplete(false);
  };

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched || selectedCards.includes(cardId)) {
      return;
    }

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    // Check for match when two cards are selected
    if (newSelected.length === 2) {
      const [firstId, secondId] = newSelected;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.verseId === secondCard.verseId) {
        // Match found!
        setTimeout(() => {
          const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
          toast.success(encouragement, {
            icon: '🌟',
            duration: 2000,
          });

          setMatchedPairs([...matchedPairs, firstCard.verseId]);
          setCards((prev) =>
            prev.map((c) =>
              c.verseId === firstCard.verseId ? { ...c, isMatched: true } : c
            )
          );
          setSelectedCards([]);

          // Check if game is complete
          if (matchedPairs.length + 1 === verses.length) {
            completeGame();
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const completeGame = async () => {
    const finalTime = Date.now() - (startTime || Date.now());
    setGameComplete(true);
    toast.success('🎉 You matched them all! Amazing job!', {
      duration: 4000,
      icon: '🏆',
    });

    // Save progress for each verse
    try {
      await Promise.all(
        verses.map((verse) =>
          fetch('/api/kids/verse-game/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              verseId: verse.id,
              success: true,
              time: finalTime,
            }),
          })
        )
      );
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              🌈 Bible Verse Matching Game
            </h2>
            <p className="mt-2 text-lg text-purple-700 dark:text-purple-300">
              Match the Bible verse with where it's found! 📖
            </p>
          </div>
          <button onClick={loadGame} className="btn-primary bg-purple-600 hover:bg-purple-700">
            <SparklesIcon className="mr-2 inline-block h-5 w-5" />
            New Game
          </button>
        </div>

        <div className="mt-6 flex gap-6">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
              Matched: {matchedPairs.length} / {verses.length}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!gameComplete && matchedPairs.length === 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-400">
          <p className="text-center text-lg font-medium text-yellow-900 dark:text-yellow-100">
            👆 Click two cards to find matching pairs! One card shows WHERE the verse is (like "John 3:16"),
            and the other shows WHAT the verse says! 🌟
          </p>
        </div>
      )}

      {/* Game Board */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => {
          const isSelected = selectedCards.includes(card.id);
          const baseColor = colorMap[card.verseId];

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched}
              className={`
                group relative min-h-32 rounded-xl p-4 text-white shadow-lg transition-all duration-300 border-4
                ${
                  card.isMatched
                    ? 'opacity-40 scale-95 bg-gray-300 border-gray-400 cursor-not-allowed'
                    : isSelected
                    ? `${baseColor} scale-105 ring-4 ring-yellow-400 shadow-2xl`
                    : `${baseColor} hover:scale-105 hover:shadow-xl`
                }
              `}
            >
              <div className="flex h-full flex-col items-center justify-center">
                {card.isMatched && (
                  <StarIcon className="absolute top-2 right-2 h-8 w-8 text-yellow-400 animate-pulse" />
                )}

                <p
                  className={`text-center font-bold leading-tight ${
                    card.type === 'reference'
                      ? 'text-xl'
                      : 'text-sm'
                  }`}
                >
                  {card.content}
                </p>

                {card.type === 'reference' && (
                  <span className="mt-2 text-xs opacity-90">📖 Bible Reference</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion Message */}
      {gameComplete && (
        <div className="card bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-4 border-green-400">
          <div className="text-center">
            <TrophyIcon className="mx-auto h-16 w-16 text-yellow-500 animate-bounce" />
            <h3 className="mt-4 text-3xl font-bold text-green-900 dark:text-green-100">
              🎉 You Did It! 🎉
            </h3>
            <p className="mt-2 text-xl text-green-700 dark:text-green-300">
              You matched all the Bible verses! You're amazing!
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button onClick={loadGame} className="btn-primary bg-purple-600 hover:bg-purple-700 text-lg">
                <SparklesIcon className="mr-2 inline-block h-6 w-6" />
                Play Again!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
