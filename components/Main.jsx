"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaRedo, FaEdit, FaEye, FaFileImport, FaFileExport } from 'react-icons/fa';
import ExerciseCard from './ExerciseCard';
import WorkoutEditor from './WorkoutEditor';

const DEFAULT_WORKOUTS = [
  { name: "No Money's", description: "Perform the No Money's exercise", repetitions: 10, sets: 2, holdTime: 5 },
  { name: "FREE WEIGHT - BILATERAL SCAPTION", description: "Perform the Bilateral Scaption exercise", repetitions: 10, sets: 2, holdTime: 5 },
  { name: "CERVICAL RETRACTION / CHIN TUCK", description: "Perform the Chin Tuck exercise", repetitions: 10, sets: 2, holdTime: 5 },
  { name: "TRUNK EXTENSION - TOWEL - AROM - MOBILIZATION", description: "Perform the Trunk Extension exercise", repetitions: 10, sets: 2, holdTime: 5 },
];

const getStoredWorkouts = () => {
  if (typeof window !== 'undefined') {
    const storedWorkouts = localStorage.getItem('workouts');
    return storedWorkouts ? JSON.parse(storedWorkouts) : null;
  }
  return null;
};

export function Main() {
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [startTime, setStartTime] = useState('00:05');
  const [restTime, setRestTime] = useState('00:05');
  const [rounds, setRounds] = useState('20');
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workouts, setWorkouts] = useState(() => getStoredWorkouts() || DEFAULT_WORKOUTS);
  const [isEditing, setIsEditing] = useState(false);
  const [importError, setImportError] = useState(null);

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

  // Color values are now handled by Tailwind classes

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
        setIsResting(true);
        remainingTimeRef.current = timeToSeconds(restTime);
      }
    }
  }, [isResting, currentRound, rounds, startTime, restTime]);

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
  }, [workouts]);

  const moveToNextExercise = () => {
    if (currentExerciseIndex < workouts.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentRound(0);
      setIsResting(false);
      remainingTimeRef.current = timeToSeconds(startTime);
    } else {
      resetTimer();
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsResting(false);
    setCurrentRound(0);
    setCurrentExerciseIndex(0);
    remainingTimeRef.current = timeToSeconds(startTime);
    setTimerDisplay(formatTime(remainingTimeRef.current));
  };

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

  const timeToSeconds = (time) => {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-heading font-bold">Workout Timer</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Export Workouts
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Import Workouts
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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {isEditing ? 'View Workout' : 'Edit Workout'}
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
              {workouts.map((workout, index) => (
                <WorkoutEditor
                  key={index}
                  exercise={workout}
                  onSave={(updatedExercise) => {
                    const updatedWorkouts = [...workouts];
                    updatedWorkouts[index] = updatedExercise;
                    setWorkouts(updatedWorkouts);
                  }}
                  onDelete={() => {
                    const updatedWorkouts = workouts.filter((_, i) => i !== index);
                    setWorkouts(updatedWorkouts);
                  }}
                  onReset={resetWorkouts}
                />
              ))}
              <button
                onClick={() => setIsEditing(false)}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Done Editing
              </button>
            </div>
          ) : (
            <>
              <div className="w-full max-w-md">
                <select
                  value={currentExerciseIndex}
                  onChange={(e) => {
                    setCurrentExerciseIndex(Number(e.target.value));
                    resetTimer();
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {workouts.map((workout, index) => (
                    <option key={index} value={index}>
                      {workout.name}
                    </option>
                  ))}
                </select>
              </div>
              <ExerciseCard exercise={workouts[currentExerciseIndex]} />
              <div className="text-7xl font-bold">{timerDisplay}</div>
              <div className="text-2xl">Round: {currentRound + 1}/{rounds}</div>
              <div className="text-2xl font-semibold">{isResting ? 'Resting' : 'Working'}</div>
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
                    resetTimer();
                    setCurrentExerciseIndex((prev) => (prev + 1) % workouts.length);
                  }}
                >
                  <FaRedo className="w-8 h-8" />
                </button>
              </div>
            </>
          )}
        </main>

        {!isEditing && (
          <div className="mt-12 bg-card text-card-foreground p-6 rounded-lg shadow-lg">
            <div className="space-y-4">
              {[
                { label: 'Start', icon: FaPlay, color: 'green', value: startTime, onChange: handleStartTimeChange },
                { label: 'Rest', icon: FaPause, color: 'red', value: restTime, onChange: handleRestTimeChange },
                { label: 'Rounds', icon: FaRedo, color: 'blue', value: rounds, onChange: handleRoundsChange },
              ].map(({ label, icon: Icon, color, value, onChange }) => (
                <div key={label} className="flex justify-between items-center w-full p-4 rounded-md bg-secondary">
                  <div className="flex items-center">
                    <Icon className="text-muted-foreground mr-2 w-5 h-5" />
                    <span className="text-foreground">{label}</span>
                  </div>
                  <input
                    value={value}
                    onChange={onChange}
                    className="w-20 text-right bg-transparent border-b border-input focus:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
