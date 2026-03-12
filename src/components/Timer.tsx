import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './ui/Text';
import { Button } from './ui/Button';

type TimerMode = 'stopwatch' | 'countdown' | 'emom';

interface TimerProps {
  mode: TimerMode;
  initialSeconds?: number;
  emomMinutes?: number;
  onComplete?: () => void;
}

export function Timer({ mode, initialSeconds = 60, emomMinutes = 10, onComplete }: TimerProps) {
  const [seconds, setSeconds] = useState(mode === 'countdown' ? initialSeconds : 0);
  const [isRunning, setIsRunning] = useState(false);
  const [emomRound, setEmomRound] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const start = useCallback(() => {
    if (mode === 'emom') {
      setEmomRound(1);
      setSeconds(60);
    } else if (mode === 'stopwatch') {
      startTimeRef.current = Date.now() - (seconds * 1000);
    }
    setIsRunning(true);
  }, [mode, seconds]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(mode === 'countdown' ? initialSeconds : 0);
    setEmomRound(1);
  }, [mode, initialSeconds]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (mode === 'stopwatch') {
        setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      } else if (mode === 'countdown') {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      } else if (mode === 'emom') {
        setSeconds((prev) => {
          if (prev <= 1) {
            if (emomRound >= emomMinutes) {
              setIsRunning(false);
              onComplete?.();
              return 0;
            }
            setEmomRound((r) => r + 1);
            return 60;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, emomRound, emomMinutes, onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text variant="h1" style={styles.time}>
          {formatTime(seconds)}
        </Text>
        {mode === 'emom' && (
          <Text variant="caption" color="muted">
            ROUND {emomRound} / {emomMinutes}
          </Text>
        )}
      </View>
      <View style={styles.controls}>
        {!isRunning ? (
          <Button title={seconds === 0 && mode !== 'stopwatch' ? 'START' : 'RESUME'} onPress={start} variant="primary" />
        ) : (
          <Button title="PAUSE" onPress={pause} variant="outline" />
        )}
        <Button title="RESET" onPress={reset} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  display: {
    marginBottom: 32,
    alignItems: 'center',
  },
  time: {
    fontFamily: 'Menlo',
    fontSize: 64,
    letterSpacing: 4,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
});
