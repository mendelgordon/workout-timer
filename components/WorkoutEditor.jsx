import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaPlus, FaBed, FaEdit, FaEye, FaTrash, FaChevronDown, FaChevronUp, FaUndo, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const WorkoutEditor = ({ initialWorkouts = [], onSave, onReset, onRemoveWorkout, onMoveUp, onMoveDown, addWorkout, addRest }) => {
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [collapsedItems, setCollapsedItems] = useState(initialWorkouts.map(() => true));

  useEffect(() => {
    setWorkouts(initialWorkouts);
    setCollapsedItems(initialWorkouts.map(() => true));
  }, [initialWorkouts]);

  const toggleCollapse = useCallback((index) => {
    setCollapsedItems(prev => {
      const newCollapsedItems = [...prev];
      newCollapsedItems[index] = !newCollapsedItems[index];
      return newCollapsedItems;
    });
  }, []);

  const handleMoveUp = useCallback((index) => {
    if (index > 0) {
      setWorkouts(prevWorkouts => {
        const updatedWorkouts = [...prevWorkouts];
        [updatedWorkouts[index - 1], updatedWorkouts[index]] = [updatedWorkouts[index], updatedWorkouts[index - 1]];
        return updatedWorkouts;
      });
      onMoveUp(index);
    }
  }, [onMoveUp]);

  const handleMoveDown = useCallback((index) => {
    setWorkouts(prevWorkouts => {
      if (index < prevWorkouts.length - 1) {
        const updatedWorkouts = [...prevWorkouts];
        [updatedWorkouts[index], updatedWorkouts[index + 1]] = [updatedWorkouts[index + 1], updatedWorkouts[index]];
        return updatedWorkouts;
      }
      return prevWorkouts;
    });
    onMoveDown(index);
  }, [onMoveDown]);

  const handleRemoveWorkout = useCallback((index) => {
    setWorkouts(prevWorkouts => prevWorkouts.filter((_, i) => i !== index));
    onRemoveWorkout(index);
  }, [onRemoveWorkout]);

  const handleSaveWorkout = useCallback((index, updatedWorkout) => {
    setWorkouts(prevWorkouts => {
      const updatedWorkouts = [...prevWorkouts];
      updatedWorkouts[index] = updatedWorkout;
      return updatedWorkouts;
    });
    onSave(index, updatedWorkout);
  }, [onSave]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-4">
      <div className="mb-4 flex space-x-2">
        <button
          onClick={addWorkout}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors group relative"
          title="Add Workout"
        >
          <FaPlus className="w-5 h-5" />
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">Add Workout</span>
        </button>
        <button
          onClick={addRest}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors group relative"
          title="Add Rest"
        >
          <FaBed className="w-5 h-5" />
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">Add Rest</span>
        </button>
      </div>
      <div>
        {workouts.map((workout, index) => (
          <div
            key={workout.id || `workout-${index}`}
            className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
          >
            <div
              className="bg-gray-200 dark:bg-gray-600 p-2 flex items-center justify-between"
              onClick={() => toggleCollapse(index)}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {workout.name ? workout.name.charAt(0).toUpperCase() + workout.name.slice(1).toLowerCase() : 'Rest'}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveUp(index);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={index === 0}
                >
                  <FaArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveDown(index);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={index === workouts.length - 1}
                >
                  <FaArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveWorkout(index);
                  }}
                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
                {collapsedItems[index] ? <FaChevronDown className="w-4 h-4" /> : <FaChevronUp className="w-4 h-4" />}
              </div>
            </div>
            {!collapsedItems[index] && (
              <div className="p-4">
                <WorkoutItem
                  workout={workout}
                  onSave={(updatedWorkout) => handleSaveWorkout(index, updatedWorkout)}
                  onRemove={() => handleRemoveWorkout(index)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all workouts to default?')) {
              onReset();
            }
          }}
          className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-md shadow-sm text-sm font-medium hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 group relative"
          title="Reset"
        >
          <FaUndo className="w-5 h-5" />
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">Reset</span>
        </button>
      </div>
    </div>
  );
};

const WorkoutItem = React.memo(({ workout, onSave, onRemove }) => {
  const [name, setName] = useState(workout.name ? workout.name.charAt(0).toUpperCase() + workout.name.slice(1).toLowerCase() : '');
  const [description, setDescription] = useState(workout.description || '');
  const [repetitions, setRepetitions] = useState(workout.repetitions || 0);
  const [sets, setSets] = useState(workout.sets || 0);
  const [holdTime, setHoldTime] = useState(workout.holdTime || 0);
  const [image, setImage] = useState(workout.image || null);
  const [isRest] = useState(workout.isRest || false);
  const [restTime, setRestTime] = useState(workout.restTime || 0);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        saveWorkout({ image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const saveWorkout = useCallback(() => {
    onSave({
      name,
      description,
      repetitions: parseInt(repetitions),
      sets: parseInt(sets),
      holdTime: parseInt(holdTime),
      image,
      isRest,
      restTime: parseInt(restTime),
    });
  }, [name, description, repetitions, sets, holdTime, image, isRest, restTime, onSave]);

  const handleInputChange = useCallback((setter) => (e) => {
    const { value } = e.target;
    setter(value);
  }, []);

  const handleBlur = useCallback(() => {
    saveWorkout();
  }, [saveWorkout]);

  return (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
      <div className="space-y-4">
        {!isRest && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleInputChange(setName)}
                onBlur={handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={handleInputChange(setDescription)}
                onBlur={handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
                rows="3"
              ></textarea>
            </div>
            <div className="flex space-x-4">
              <div>
                <label htmlFor="repetitions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repetitions</label>
                <input
                  type="number"
                  id="repetitions"
                  name="repetitions"
                  value={repetitions}
                  onChange={handleInputChange(setRepetitions)}
                  onBlur={handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="sets" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sets</label>
                <input
                  type="number"
                  id="sets"
                  name="sets"
                  value={sets}
                  onChange={handleInputChange(setSets)}
                  onBlur={handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="holdTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hold Time (s)</label>
                <input
                  type="number"
                  id="holdTime"
                  name="holdTime"
                  value={holdTime}
                  onChange={handleInputChange(setHoldTime)}
                  onBlur={handleBlur}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
              <input
                type="file"
                id="image"
                onChange={handleImageUpload}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
                accept="image/*"
              />
            </div>
            {image && (
              <div className="relative w-full h-48">
                <Image
                  src={image}
                  alt="Exercise preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            )}
          </>
        )}
        {isRest && (
          <div>
            <label htmlFor="restTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rest Time (seconds)</label>
            <input
              type="number"
              id="restTime"
              name="restTime"
              value={restTime}
              onChange={handleInputChange(setRestTime)}
              onBlur={handleBlur}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
              min="0"
              required
            />
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end items-center">
        <button
          type="button"
          onClick={onRemove}
          className="group relative px-4 py-2 border border-red-500 text-red-500 rounded-md shadow-sm text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          title="Remove"
        >
          <FaTrash className="w-5 h-5" />
          <span className="absolute left-full ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2">Remove</span>
        </button>
      </div>
    </div>
  );
});

export default WorkoutEditor;
