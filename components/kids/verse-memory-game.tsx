'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SparklesIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';

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
  isFlipped: boolean;
  isMatched: boolean;
};

export function VerseMemoryGame() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Load verses and initialize game
  useEffect(() => {
    loadGame();
  }, []);

  // Timer
  useEffect(() => {
    if (!startTime || gameComplete) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, gameComplete]);

  const loadGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kids/verse-game?count=6');
      if (!response.ok) throw new Error('Failed to load verses');

      const data = await response.json();
      setVerses(data);
      initializeCards(data);
      setStartTime(Date.now());
    } catch (error) {
      toast.error('Failed to load game');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCards = (verses: Verse[]) => {
    const newCards: Card[] = [];

    verses.forEach((verse) => {
      newCards.push({
        id: `ref-${verse.id}`,
        verseId: verse.id,
        content: verse.reference,
        type: 'reference',
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: `text-${verse.id}`,
        verseId: verse.id,
        content: verse.text,
        type: 'text',
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameComplete(false);
  };

  const handleCardClick = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched || flippedCards.includes(cardId) || flippedCards.length === 2) {
      return;
    }

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setMoves(moves + 1);

    // Update card state
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    // Check for match when two cards are flipped
    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.verseId === secondCard.verseId) {
        // Match found
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstCard.verseId]);
          setCards((prev) =>
            prev.map((c) =>
              c.verseId === firstCard.verseId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);

          // Check if game is complete
          if (matchedPairs.length + 1 === verses.length) {
            completeGame();
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) && !c.isMatched
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const completeGame = async () => {
    const finalTime = Date.now() - (startTime || Date.now());
    setGameComplete(true);
    toast.success('Congratulations! You completed the game!');

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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Bible Verse Memory Match
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Match Bible references with their verses
            </p>
          </div>
          <button onClick={loadGame} className="btn-secondary">
            New Game
          </button>
        </div>

        <div className="mt-6 flex gap-6">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Moves: {moves}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Time: {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Matched: {matchedPairs.length}/{verses.length}
            </span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || flippedCards.includes(card.id)}
            className={`group relative h-32 rounded-lg transition-all duration-300 ${
              card.isFlipped || card.isMatched
                ? card.type === 'reference'
                  ? 'bg-brand-500 text-white'
                  : 'bg-purple-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            } ${
              card.isMatched ? 'opacity-60 scale-95' : ''
            } disabled:cursor-not-allowed`}
          >
            <div className="flex h-full items-center justify-center p-3">
              {card.isFlipped || card.isMatched ? (
                <p
                  className={`text-center ${
                    card.type === 'reference' ? 'text-sm font-bold' : 'text-xs'
                  } line-clamp-4`}
                >
                  {card.content}
                </p>
              ) : (
                <SparklesIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Completion Message */}
      {gameComplete && (
        <div className="card bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950 dark:to-purple-950">
          <div className="text-center">
            <TrophyIcon className="mx-auto h-12 w-12 text-brand-600 dark:text-brand-400" />
            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Congratulations!
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              You completed the game in {moves} moves and {formatTime(elapsedTime)}!
            </p>
            <button onClick={loadGame} className="btn-primary mt-6">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
