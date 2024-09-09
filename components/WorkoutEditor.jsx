import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaBars, FaGripLines, FaPlus, FaBed, FaEdit, FaEye, FaTrash, FaSave, FaTimes, FaUndo } from 'react-icons/fa';

const WorkoutEditor = ({ workouts = [], onSave, onCancel, onReset, onRemoveWorkout, onReorder, addWorkout, addRest }) => {
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) {
      return;
    }
    onReorder(result.source.index, result.destination.index);
  }, [onReorder]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Tip: Use the grip handle to drag and drop workouts to reorder them.
      </p>
      <div className="mb-4 flex space-x-2">
        <button
          onClick={addWorkout}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          title="Add Workout"
        >
          <FaPlus className="w-5 h-5" />
        </button>
        <button
          onClick={addRest}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          title="Add Rest"
        >
          <FaBed className="w-5 h-5" />
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="workouts">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {workouts.map((workout, index) => (
                <Draggable key={workout.id || `workout-${index}`} draggableId={workout.id || `workout-${index}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="bg-gray-200 dark:bg-gray-600 p-2 cursor-move flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {workout.name || 'Rest'}
                        </span>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Drag to reorder</span>
                          <FaGripLines className="text-gray-500 dark:text-gray-400 w-5 h-5" />
                        </div>
                      </div>
                      <div className="p-4">
                        <WorkoutItem
                          workout={workout}
                          onSave={(updatedWorkout) => onSave(index, updatedWorkout)}
                          onRemove={() => onRemoveWorkout(index)}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          title="Cancel"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 border border-yellow-500 text-yellow-500 rounded-md shadow-sm text-sm font-medium hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          title="Reset"
        >
          <FaUndo className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const WorkoutItem = ({ workout, onSave, onRemove }) => {
  const [name, setName] = useState(workout.name || '');
  const [description, setDescription] = useState(workout.description || '');
  const [repetitions, setRepetitions] = useState(workout.repetitions || 0);
  const [sets, setSets] = useState(workout.sets || 0);
  const [holdTime, setHoldTime] = useState(workout.holdTime || 0);
  const [image, setImage] = useState(workout.image || null);
  const [isRest, setIsRest] = useState(workout.isRest || false);
  const [restTime, setRestTime] = useState(workout.restTime || 0);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      description,
      repetitions: parseInt(repetitions),
      sets: parseInt(sets),
      holdTime: parseInt(holdTime),
      image,
      isRest,
      restTime: parseInt(restTime)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
      <div className="space-y-4">
        {!isRest && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                rows="3"
              ></textarea>
            </div>
            <div className="flex space-x-4">
              <div>
                <label htmlFor="repetitions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repetitions</label>
                <input
                  type="number"
                  id="repetitions"
                  value={repetitions}
                  onChange={(e) => setRepetitions(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="sets" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sets</label>
                <input
                  type="number"
                  id="sets"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  min="0"
                  required
                />
              </div>
              <div>
                <label htmlFor="holdTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hold Time (s)</label>
                <input
                  type="number"
                  id="holdTime"
                  value={holdTime}
                  onChange={(e) => setHoldTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
              value={restTime}
              onChange={(e) => setRestTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="0"
              required
            />
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-2 border border-red-500 text-red-500 rounded-md shadow-sm text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          title="Remove"
        >
          <FaTrash className="w-5 h-5" />
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          title="Save"
        >
          <FaSave className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default WorkoutEditor;
