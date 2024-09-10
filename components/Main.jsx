"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaRedo, FaEdit, FaEye, FaFileImport, FaFileExport } from 'react-icons/fa';
import ExerciseCard from './ExerciseCard';
import WorkoutEditor from './WorkoutEditor';

const DEFAULT_WORKOUTS = [
  { name: "No Money's", description: "Perform the No Money's exercise", repetitions: 10, sets: 2, holdTime: 5 },
  { name: "Free Weight - Bilateral Scaption", description: "Perform the Bilateral Scaption exercise", repetitions: 10, sets: 2, holdTime: 5 },
  { name: "Cervical Retraction / Chin Tuck", description: "Perform the Chin Tuck exercise", repetitions: 10, sets: 2, holdTime: 5 },
  { name: "Trunk Extension - Towel - Arom - Mobilization", description: "Perform the Trunk Extension exercise", repetitions: 10, sets: 2, holdTime: 5 },
];

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
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
  const [workouts, setWorkouts] = useLocalStorage('workouts', DEFAULT_WORKOUTS);
  const [isEditing, setIsEditing] = useState(false);
  const [importError, setImportError] = useState(null);

  const handleSaveWorkout = useCallback((index, updatedWorkout) => {
    console.log('Saving workout:', index, updatedWorkout);
    setWorkouts(prevWorkouts => {
      if (JSON.stringify(prevWorkouts[index]) === JSON.stringify(updatedWorkout)) {
        console.log('No changes detected, returning previous workouts');
        return prevWorkouts;
      }
      const updatedWorkouts = [...prevWorkouts];
      updatedWorkouts[index] = updatedWorkout;
      console.log('Updated workouts:', updatedWorkouts);
      return updatedWorkouts;
    });
  }, [setWorkouts]);

  const handleMoveUp = useCallback((index) => {
    if (index > 0) {
      setWorkouts(prevWorkouts => {
        const updatedWorkouts = [...prevWorkouts];
        [updatedWorkouts[index - 1], updatedWorkouts[index]] = [updatedWorkouts[index], updatedWorkouts[index - 1]];
        return updatedWorkouts;
      });
    }
  }, [setWorkouts]);

  const handleMoveDown = useCallback((index) => {
    setWorkouts(prevWorkouts => {
      if (index < prevWorkouts.length - 1) {
        const updatedWorkouts = [...prevWorkouts];
        [updatedWorkouts[index], updatedWorkouts[index + 1]] = [updatedWorkouts[index + 1], updatedWorkouts[index]];
        return updatedWorkouts;
      }
      return prevWorkouts;
    });
  }, [setWorkouts]);

  const handleResetWorkouts = useCallback(() => {
    localStorage.removeItem('workouts');
    setWorkouts(DEFAULT_WORKOUTS);
  }, []);

  const intervalRef = useRef(null);
  const remainingTimeRef = useRef(0);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(workouts);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'workouts.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedWorkouts = JSON.parse(e.target.result);
        setWorkouts(importedWorkouts);
        setImportError(null);
      } catch (error) {
        setImportError('Failed to import workouts. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const resetWorkouts = () => {
    if (window.confirm('Are you sure you want to reset all workouts to default?')) {
      setWorkouts(DEFAULT_WORKOUTS);
    }
  };

  const addWorkout = () => {
    setWorkouts([...workouts, { name: 'New Workout', description: '', repetitions: 0, sets: 0, holdTime: 0 }]);
  };

  const addRest = () => {
    setWorkouts([...workouts, { isRest: true, restTime: 60 }]);
  };

  const removeWorkout = useCallback((index) => {
    setWorkouts(prevWorkouts => prevWorkouts.filter((_, i) => i !== index));
  }, []);

  const onMoveUp = (index) => {
    if (index > 0) {
      const updatedWorkouts = [...workouts];
      [updatedWorkouts[index - 1], updatedWorkouts[index]] = [updatedWorkouts[index], updatedWorkouts[index - 1]];
      setWorkouts(updatedWorkouts);
    }
  };

  const onMoveDown = (index) => {
    if (index < workouts.length - 1) {
      const updatedWorkouts = [...workouts];
      [updatedWorkouts[index], updatedWorkouts[index + 1]] = [updatedWorkouts[index + 1], updatedWorkouts[index]];
      setWorkouts(updatedWorkouts);
    }
  };

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

  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
    console.log('Saved workouts to localStorage:', workouts);
  }, [workouts]);

  const resetTimer = useCallback(() => {
    moveToNextExercise();
  }, [moveToNextExercise]);

  const toggleTimer = () => {
    if (!isRunning) {
      if (currentRound === 0) {
        remainingTimeRef.current = timeToSeconds(startTime);
        setTimerDisplay(startTime);
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
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
          <div className="flex flex-wrap justify-center sm:justify-end space-x-2 space-y-2 sm:space-y-0">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors group relative"
              title="Export"
            >
              <FaFileExport className="w-5 h-5" />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">Export</span>
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors group relative"
              title="Import"
            >
              <FaFileImport className="w-5 h-5" />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              style={{ display: 'none' }}
              accept=".json"
            />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors group relative"
              title={isEditing ? "View Workout" : "Edit Workout"}
            >
              {isEditing ? <FaEye className="w-5 h-5" /> : <FaEdit className="w-5 h-5" />}
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                {isEditing ? 'View Workout' : 'Edit Workout'}
              </span>
            </button>
          </div>
        </header>

        {importError && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {importError}
          </div>
        )}

        <main className="flex flex-col items-center space-y-8 w-full">
          {isEditing ? (
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-4">Edit Workouts</h2>
              <WorkoutEditor
                workouts={workouts}
                onSave={handleSaveWorkout}
                onRemoveWorkout={removeWorkout}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                addWorkout={addWorkout}
                addRest={addRest}
                onReset={handleResetWorkouts}
                setWorkouts={setWorkouts}
              />
              <div className="mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Done Editing
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </main>
      </div>
    </div>
  );
}
