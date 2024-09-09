import React from 'react';
import Image from 'next/image';

const ExerciseCard = ({ exercise, image }) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 max-w-[300px] w-full">
      <div className="flex flex-col space-y-4">
        {image && (
          <div className="relative w-full h-[200px]">
            <Image
              src={image}
              alt={exercise.name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {exercise.name}
        </h2>
        <p className="text-gray-800 dark:text-white">{exercise.description}</p>
        <p className="text-gray-800 dark:text-white">
          Repetitions: {exercise.repetitions} | Sets: {exercise.sets}
        </p>
        <p className="text-gray-800 dark:text-white">Hold for {exercise.holdTime} seconds</p>
      </div>
    </div>
  );
};

export default ExerciseCard;
