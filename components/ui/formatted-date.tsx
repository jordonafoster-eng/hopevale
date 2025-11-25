'use client';

type FormattedDateProps = {
  date: Date | string | null;
  showTime?: boolean;
  fallback?: string;
};

export function FormattedDate({ date, showTime = true, fallback = 'Date TBD' }: FormattedDateProps) {
  if (!date) return <>{fallback}</>;

  const d = typeof date === 'string' ? new Date(date) : date;

  if (showTime) {
    return (
      <>
        {new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).format(d)}
      </>
    );
  }

  return (
    <>
      {new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(d)}
    </>
  );
}
