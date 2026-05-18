import { useEffect, useState, useRef } from 'react';

export const useCountUp = (isActive: boolean) => {
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: number;

    if (isActive) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }

      interval = setInterval(() => {
        if (startTimeRef.current !== null) {
          const now = Date.now();
          const elapsed = Math.floor((now - startTimeRef.current) / 1000);
          setSeconds(elapsed);
        }
      }, 1000);
    } else {
      startTimeRef.current = null;
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatted = formatDuration(seconds);

  return { seconds, formatted };
};

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}
