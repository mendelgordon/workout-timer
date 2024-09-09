import React from 'react';
import { Box, Text, Image, VStack, useColorModeValue } from '@chakra-ui/react';

const ExerciseCard = ({ exercise, image }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
      p={4}
      maxWidth="300px"
      width="100%"
    >
      <VStack spacing={4} align="stretch">
        {image && (
          <Image
            src={image}
            alt={exercise.name}
            borderRadius="md"
            objectFit="cover"
            maxHeight="200px"
          />
        )}
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          {exercise.name}
        </Text>
        <Text color={textColor}>{exercise.description}</Text>
        <Text color={textColor}>
          Repetitions: {exercise.repetitions} | Sets: {exercise.sets}
        </Text>
        <Text color={textColor}>Hold for {exercise.holdTime} seconds</Text>
      </VStack>
    </Box>
  );
};

export default ExerciseCard;
