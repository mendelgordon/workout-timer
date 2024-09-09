import React, { useState } from 'react';

const WorkoutEditor = ({ exercise = {}, onSave, onCancel, onReset }) => {
  const [name, setName] = useState(exercise.name || '');
  const [description, setDescription] = useState(exercise.description || '');
  const [repetitions, setRepetitions] = useState(exercise.repetitions || 0);
  const [sets, setSets] = useState(exercise.sets || 0);
  const [holdTime, setHoldTime] = useState(exercise.holdTime || 0);
  const [image, setImage] = useState(exercise.image || null);

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
      image
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all workouts to default? This action cannot be undone.')) {
      onReset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="space-y-4">
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
          <label htmlFor="holdTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hold Time (seconds)</label>
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
          <div>
            <img src={image} alt="Exercise preview" className="mt-2 rounded-md max-h-48 object-cover" />
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-between items-center">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border border-red-500 text-red-500 rounded-md shadow-sm text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Reset All Workouts
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default WorkoutEditor;
