import { useState, useEffect, useRef } from 'react';

const useTimer = (externalReset, startTime) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (startTime) {
          // Calcula o tempo decorrido baseado no tempo inicial do servidor
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          setSeconds(elapsed);
        } else {
          // Fallback para o comportamento anterior
          setSeconds(prev => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, startTime]);

  // Effect para escutar reset externo
  useEffect(() => {
    if (externalReset) {
      setSeconds(0);
      setIsRunning(true);
    }
  }, [externalReset]);

  // Effect para sincronizar com o tempo inicial do servidor
  useEffect(() => {
    if (startTime) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setSeconds(elapsed);
      setIsRunning(true);
    }
  }, [startTime]);

  const reset = () => {
    setSeconds(0);
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    setIsRunning(true);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    seconds,
    formattedTime: formatTime(seconds),
    isRunning,
    reset,
    pause,
    resume
  };
};

export default useTimer;
