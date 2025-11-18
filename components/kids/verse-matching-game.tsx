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

export function VerseMatchingGame() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [referenceCards, setReferenceCards] = useState<Card[]>([]);
  const [textCards, setTextCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const references: Card[] = [];
    const texts: Card[] = [];

    verses.forEach((verse) => {
      references.push({
        id: `ref-${verse.id}`,
        verseId: verse.id,
        content: verse.reference,
        type: 'reference',
        isMatched: false,
      });
      texts.push({
        id: `text-${verse.id}`,
        verseId: verse.id,
        content: verse.text,
        type: 'text',
        isMatched: false,
      });
    });

    // Shuffle each column independently
    const shuffledRefs = references.sort(() => Math.random() - 0.5);
    const shuffledTexts = texts.sort(() => Math.random() - 0.5);

    setReferenceCards(shuffledRefs);
    setTextCards(shuffledTexts);
    setSelectedCards([]);
    setMatchedPairs([]);
    setGameComplete(false);
  };

  const handleCardClick = (cardId: string) => {
    const allCards = [...referenceCards, ...textCards];
    const card = allCards.find((c) => c.id === cardId);

    if (!card || card.isMatched || selectedCards.includes(cardId)) {
      return;
    }

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    // Check for match when two cards are selected
    if (newSelected.length === 2) {
      const [firstId, secondId] = newSelected;
      const firstCard = allCards.find((c) => c.id === firstId);
      const secondCard = allCards.find((c) => c.id === secondId);

      // Must select one from each column
      if (firstCard && secondCard && firstCard.type === secondCard.type) {
        // Same column selected - not allowed
        setTimeout(() => {
          setSelectedCards([]);
        }, 500);
        return;
      }

      if (firstCard && secondCard && firstCard.verseId === secondCard.verseId) {
        // Match found!
        setTimeout(() => {
          const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
          toast.success(encouragement, {
            icon: '🌟',
            duration: 2000,
          });

          setMatchedPairs([...matchedPairs, firstCard.verseId]);
          setReferenceCards((prev) =>
            prev.map((c) =>
              c.verseId === firstCard.verseId ? { ...c, isMatched: true } : c
            )
          );
          setTextCards((prev) =>
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
              Match the Bible verse with where it&apos;s found! 📖
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
            👆 Click one card from the LEFT column and one from the RIGHT column to find matching pairs!
            Match the Bible reference with its verse! 🌟
          </p>
        </div>
      )}

      {/* Game Board - Two Columns */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column - References */}
        <div className="space-y-3">
          <h3 className="text-center text-xl font-bold text-purple-900 dark:text-purple-100">
            📖 Bible References
          </h3>
          <div className="space-y-3">
            {referenceCards.map((card) => {
              const isSelected = selectedCards.includes(card.id);

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched}
                  className={`
                    relative w-full rounded-xl p-5 text-white shadow-lg transition-all duration-300 border-4
                    ${
                      card.isMatched
                        ? 'opacity-40 scale-95 bg-gray-300 border-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-purple-500 border-purple-600 scale-105 ring-4 ring-yellow-400 shadow-2xl'
                        : 'bg-purple-500 hover:bg-purple-600 border-purple-600 hover:scale-105 hover:shadow-xl'
                    }
                  `}
                >
                  <div className="flex items-center justify-center">
                    {card.isMatched && (
                      <StarIcon className="absolute top-2 right-2 h-6 w-6 text-yellow-400 animate-pulse" />
                    )}
                    <p className="text-2xl font-bold text-center">
                      {card.content}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column - Verses */}
        <div className="space-y-3">
          <h3 className="text-center text-xl font-bold text-blue-900 dark:text-blue-100">
            ✨ Bible Verses
          </h3>
          <div className="space-y-3">
            {textCards.map((card) => {
              const isSelected = selectedCards.includes(card.id);

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched}
                  className={`
                    relative w-full rounded-xl p-5 text-white shadow-lg transition-all duration-300 border-4
                    ${
                      card.isMatched
                        ? 'opacity-40 scale-95 bg-gray-300 border-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-500 border-blue-600 scale-105 ring-4 ring-yellow-400 shadow-2xl'
                        : 'bg-blue-500 hover:bg-blue-600 border-blue-600 hover:scale-105 hover:shadow-xl'
                    }
                  `}
                >
                  <div className="flex items-center justify-center min-h-[60px]">
                    {card.isMatched && (
                      <StarIcon className="absolute top-2 right-2 h-6 w-6 text-yellow-400 animate-pulse" />
                    )}
                    <p className="text-base font-semibold text-center leading-relaxed">
                      {card.content}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
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
              You matched all the Bible verses! You&apos;re amazing!
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
