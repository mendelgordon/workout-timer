"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import ExerciseCard from './ExerciseCard';
import workoutsData from '../workouts.json';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue];
};

export default function Main() {
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [startTime, setStartTime] = useState('00:05');
  const [restTime, setRestTime] = useState('00:05');
  const [rounds, setRounds] = useState('20');
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workouts, setWorkouts] = useState(workoutsData);

  useEffect(() => {
    const storedWorkouts = localStorage.getItem('workouts');
    if (storedWorkouts) {
      setWorkouts(JSON.parse(storedWorkouts));
    }
  }, []);

  const intervalRef = useRef(null);
  const remainingTimeRef = useRef(0);

  const timeToSeconds = (time) => {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const moveToNextExercise = useCallback(() => {
    if (currentRound < parseInt(rounds) - 1) {
      // Move to the next round of the current exercise
      setCurrentRound(prev => prev + 1);
      setIsResting(false);
      remainingTimeRef.current = timeToSeconds(startTime);
    } else if (currentExerciseIndex < workouts.length - 1) {
      // Move to the next exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentRound(0);
      setIsResting(false);
      remainingTimeRef.current = timeToSeconds(startTime);
    } else {
      // End of workout
      clearInterval(intervalRef.current);
      setIsRunning(false);
      setIsResting(false);
      setCurrentRound(0);
      setCurrentExerciseIndex(0);
      remainingTimeRef.current = timeToSeconds(startTime);
      setTimerDisplay(formatTime(remainingTimeRef.current));
    }
  }, [currentRound, rounds, currentExerciseIndex, workouts.length, setCurrentExerciseIndex, setCurrentRound, setIsResting, startTime, setIsRunning, setTimerDisplay]);

  const updateTimer = useCallback(() => {
    if (remainingTimeRef.current > 0) {
      remainingTimeRef.current--;
      setTimerDisplay(formatTime(remainingTimeRef.current));
    } else {
      if (isResting) {
        if (currentRound < parseInt(rounds) - 1) {
          setCurrentRound(prev => prev + 1);
          setIsResting(false);
          remainingTimeRef.current = timeToSeconds(startTime);
        } else {
          moveToNextExercise();
        }
      } else {
        // Check if this is the last exercise and last round
        if (currentExerciseIndex === workouts.length - 1 && currentRound === parseInt(rounds) - 1) {
          // Stop the timer and reset the workout
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setCurrentRound(0);
          setCurrentExerciseIndex(0);
          setIsResting(false);
          remainingTimeRef.current = timeToSeconds(startTime);
          setTimerDisplay(formatTime(remainingTimeRef.current));
        } else {
          setIsResting(true);
          remainingTimeRef.current = timeToSeconds(restTime);
        }
      }
    }
    setTimerDisplay(formatTime(Math.max(0, remainingTimeRef.current)));
  }, [isResting, currentRound, rounds, startTime, restTime, moveToNextExercise, setTimerDisplay, setCurrentRound, setIsResting, currentExerciseIndex, workouts.length, setIsRunning, setCurrentExerciseIndex]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, updateTimer]);

  const resetTimer = useCallback(() => {
    moveToNextExercise();
  }, [moveToNextExercise]);

  const toggleTimer = () => {
    if (!isRunning) {
      if (remainingTimeRef.current === 0) {
        // Reset timer if it's at 0
        remainingTimeRef.current = timeToSeconds(startTime);
        setTimerDisplay(formatTime(remainingTimeRef.current));
      }
      setIsRunning(true);
      // Start the interval immediately
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      setIsRunning(false);
      clearInterval(intervalRef.current);
    }
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    if (!isRunning && !isResting) {
      remainingTimeRef.current = timeToSeconds(e.target.value);
      setTimerDisplay(formatTime(remainingTimeRef.current));
    }
  };

  const handleRestTimeChange = (e) => setRestTime(e.target.value);
  const handleRoundsChange = (e) => setRounds(e.target.value);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-4xl font-heading font-bold mb-4 sm:mb-0">Workout Timer</h1>
        </header>

        <main className="flex flex-col items-center space-y-8 w-full">
          <div className="w-full max-w-2xl flex flex-col items-center space-y-6">
            <div className="w-full flex justify-between items-center">
              <select
                value={currentExerciseIndex}
                onChange={(e) => {
                  const newIndex = Number(e.target.value);
                  setCurrentExerciseIndex(newIndex);
                  setCurrentRound(0);
                  setIsResting(false);
                  remainingTimeRef.current = timeToSeconds(startTime);
                  setTimerDisplay(formatTime(remainingTimeRef.current));
                  if (isRunning) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = setInterval(updateTimer, 1000);
                  }
                }}
                className="w-2/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {workouts.map((workout, index) => (
                  <option key={index} value={index}>
                    {workout.isRest ? `Rest (${workout.restTime}s)` : workout.name}
                  </option>
                ))}
              </select>
              <div className="text-xl font-semibold">
                Round: {currentRound + 1}/{rounds}
              </div>
            </div>

            <div className="text-7xl font-bold">{timerDisplay}</div>

            <div className="text-2xl font-semibold">
              {isResting ? 'Resting' : workouts[currentExerciseIndex].isRest ? 'Rest Period' : 'Working'}
            </div>

            {!workouts[currentExerciseIndex].isRest && (
              <ExerciseCard
                exercise={workouts[currentExerciseIndex]}
                image={workouts[currentExerciseIndex].image}
                width={300}
                height={200}
                layout="responsive"
              />
            )}

            <div className="flex space-x-4">
              <button
                className="p-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
                onClick={toggleTimer}
                data-testid="play-pause-button"
              >
                {isRunning ? <FaPause className="w-8 h-8" /> : <FaPlay className="w-8 h-8" />}
              </button>
              <button
                className="p-6 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors shadow-lg"
                onClick={() => {
                  moveToNextExercise();
                }}
              >
                <FaRedo className="w-8 h-8" />
              </button>
            </div>

            <div className="w-full bg-card text-card-foreground p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Start', icon: FaPlay, color: 'green', value: startTime, onChange: handleStartTimeChange },
                  { label: 'Rest', icon: FaPause, color: 'red', value: restTime, onChange: handleRestTimeChange },
                  { label: 'Rounds', icon: FaRedo, color: 'blue', value: rounds, onChange: handleRoundsChange },
                ].map(({ label, icon: Icon, color, value, onChange }) => (
                  <div key={label} className="flex flex-col items-center p-4 rounded-md bg-secondary">
                    <div className="flex items-center mb-2">
                      <Icon className={`text-${color}-500 mr-2 w-5 h-5`} />
                      <span className="text-foreground">{label}</span>
                    </div>
                    <input
                      value={value}
                      onChange={onChange}
                      className="w-20 text-center bg-transparent border-b border-input focus:border-primary transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
