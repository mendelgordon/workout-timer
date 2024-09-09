import React from 'react';

const ExerciseCard = ({ exercise, image }) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 max-w-[300px] w-full">
      <div className="flex flex-col space-y-4">
        {image && (
          <img
            src={image}
            alt={exercise.name}
            className="rounded-md object-cover max-h-[200px]"
          />
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
