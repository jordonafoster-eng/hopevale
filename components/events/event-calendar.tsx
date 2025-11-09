'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type Event = {
  id: string;
  title: string;
  startAt: Date | null;
  endAt: Date | null;
  location: string | null;
  isPotluck: boolean;
  capacity: number | null;
  totalAttendees: number;
};

export function EventCalendar({ events }: { events: Event[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Get days from previous month to fill the grid
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = Array.from(
    { length: startingDayOfWeek },
    (_, i) => daysInPrevMonth - startingDayOfWeek + i + 1
  );

  // Get days for current month
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get days from next month to complete the grid (ensure 6 rows)
  const totalDays = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDays = Array.from(
    { length: 42 - totalDays }, // 6 rows * 7 days = 42
    (_, i) => i + 1
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get events for a specific day
  const getEventsForDay = (day: number, monthOffset: number = 0) => {
    const targetDate = new Date(year, month + monthOffset, day);
    return events.filter((event) => {
      if (!event.startAt) return false; // Skip events without a date
      const eventDate = new Date(event.startAt);
      return (
        eventDate.getDate() === targetDate.getDate() &&
        eventDate.getMonth() === targetDate.getMonth() &&
        eventDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number, monthOffset: number = 0) => {
    const today = new Date();
    const checkDate = new Date(year, month + monthOffset, day);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="card mt-6">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="btn-secondary text-sm"
          >
            Today
          </button>
          <button
            onClick={goToPreviousMonth}
            className="btn-secondary p-2"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="btn-secondary p-2"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px rounded-lg bg-gray-200 dark:bg-gray-700">
        {/* Day Names */}
        {dayNames.map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {day}
          </div>
        ))}

        {/* Previous Month Days */}
        {prevMonthDays.map((day) => {
          const dayEvents = getEventsForDay(day, -1);
          return (
            <div
              key={`prev-${day}`}
              className="min-h-[100px] bg-white p-2 dark:bg-gray-900"
            >
              <div className="text-sm text-gray-400 dark:text-gray-600">{day}</div>
              {dayEvents.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block truncate rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      {event.title}
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Current Month Days */}
        {currentMonthDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isTodayDate = isToday(day);
          return (
            <div
              key={`current-${day}`}
              className={`min-h-[100px] bg-white p-2 dark:bg-gray-900 ${
                isTodayDate ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              <div
                className={`text-sm font-semibold ${
                  isTodayDate
                    ? 'flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {day}
              </div>
              {dayEvents.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className={`block truncate rounded px-1 py-0.5 text-xs hover:opacity-80 ${
                        event.isPotluck
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400'
                      }`}
                      title={event.title}
                    >
                      {event.startAt && new Date(event.startAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}{' '}
                      {event.title}
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Next Month Days */}
        {nextMonthDays.map((day) => {
          const dayEvents = getEventsForDay(day, 1);
          return (
            <div
              key={`next-${day}`}
              className="min-h-[100px] bg-white p-2 dark:bg-gray-900"
            >
              <div className="text-sm text-gray-400 dark:text-gray-600">{day}</div>
              {dayEvents.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block truncate rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      {event.title}
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-brand-100 dark:bg-brand-900/20"></div>
          <span className="text-gray-600 dark:text-gray-400">Regular Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-purple-100 dark:bg-purple-900/20"></div>
          <span className="text-gray-600 dark:text-gray-400">Potluck</span>
        </div>
      </div>
    </div>
  );
}
