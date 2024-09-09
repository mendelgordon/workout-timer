"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Flex,
  Icon,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import ExerciseCard from './ExerciseCard';

export function Main() {
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [startTime, setStartTime] = useState('00:05');
  const [restTime, setRestTime] = useState('00:05');
  const [rounds, setRounds] = useState('20');
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const intervalRef = useRef(null);
  const remainingTimeRef = useRef(0);

  const bgGradient = useColorModeValue('linear(to-b, pink.500, red.500)', 'linear(to-b, pink.700, red.700)');
  const textColor = useColorModeValue('white', 'gray.200');
  const sectionBg = useColorModeValue('white', 'gray.700');

  const exercises = [
    { name: "No Money's", description: "Perform the No Money's exercise", repetitions: 10, sets: 2, holdTime: 5 },
    { name: "FREE WEIGHT - BILATERAL SCAPTION", description: "Perform the Bilateral Scaption exercise", repetitions: 10, sets: 2, holdTime: 5 },
    { name: "CERVICAL RETRACTION / CHIN TUCK", description: "Perform the Chin Tuck exercise", repetitions: 10, sets: 2, holdTime: 5 },
    { name: "TRUNK EXTENSION - TOWEL - AROM - MOBILIZATION", description: "Perform the Trunk Extension exercise", repetitions: 10, sets: 2, holdTime: 5 },
  ];

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
  }, [isRunning, isResting]);

  const updateTimer = () => {
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
  };

  const moveToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
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
    <Box minH="100vh" bg="pink.500" color={useColorModeValue('white', 'gray.200')}>
      <VStack spacing={8} align="stretch">
        <Flex as="header" justify="space-between" p={4}>
          <Heading size="md">Workout Timer</Heading>
        </Flex>

        <VStack as="main" spacing={6} flex={1} justify="center">
          <ExerciseCard exercise={exercises[currentExerciseIndex]} />
          <Text fontSize="6xl" fontWeight="bold">{timerDisplay}</Text>
          <Text fontSize="xl">Round: {currentRound + 1}/{rounds}</Text>
          <Text fontSize="xl">{isResting ? 'Resting' : 'Working'}</Text>
          <Button
            size="lg"
            rounded="full"
            bg="white"
            color="red.500"
            onClick={toggleTimer}
            data-testid="play-pause-button"
          >
            <Icon as={isRunning ? FaPause : FaPlay} />
          </Button>
        </VStack>

        <Box bg={sectionBg} p={4} borderTopRadius="3xl">
          <VStack spacing={4}>
            <Flex justify="space-between" w="full" bg="green.100" p={4} borderRadius="md">
              <Flex align="center">
                <Icon as={FaPlay} color="green.500" mr={2} />
                <Text color="gray.700">Start</Text>
              </Flex>
              <Input
                value={startTime}
                onChange={handleStartTimeChange}
                w="70px"
                textAlign="right"
                color="green.500"
              />
            </Flex>
            <Flex justify="space-between" w="full" bg="red.100" p={4} borderRadius="md">
              <Flex align="center">
                <Icon as={FaPause} color="red.500" mr={2} />
                <Text color="gray.700">Rest</Text>
              </Flex>
              <Input
                value={restTime}
                onChange={handleRestTimeChange}
                w="70px"
                textAlign="right"
                color="red.500"
              />
            </Flex>
            <Flex justify="space-between" w="full" bg="blue.100" p={4} borderRadius="md">
              <Flex align="center">
                <Icon as={FaRedo} color="blue.500" mr={2} />
                <Text color="gray.700">Rounds</Text>
              </Flex>
              <Input
                value={rounds}
                onChange={handleRoundsChange}
                w="70px"
                textAlign="right"
                color="blue.500"
              />
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
