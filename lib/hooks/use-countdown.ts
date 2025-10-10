import { useState, useEffect, useRef, useCallback } from "react";

type UseCountdownOptions = {
  onCountdownEnd?: () => void;
};

const useCountdown = (
  initialSeconds: number,
  options?: UseCountdownOptions,
) => {
  const [count, setCount] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCountdownEndRef = useRef(options?.onCountdownEnd);

  useEffect(() => {
    onCountdownEndRef.current = options?.onCountdownEnd;
  }, [options?.onCountdownEnd]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          onCountdownEndRef.current?.();
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const reset = useCallback((count: number) => {
    setCount(count);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (count > 0) {
      setIsRunning(true);
    }
  }, [count]);

  return {
    count,
    reset,
    isRunning,
    pause,
    resume,
  };
};

export default useCountdown;
