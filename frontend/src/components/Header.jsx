import React from 'react';
import { Plus, History } from 'lucide-react';

export default function Header({ onCreateTask, onViewAllHistory }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-l from-gray-600 to-black bg-clip-text hover:from-black-700 hover:to-red-900 text-transparent flex items-center gap-2 sm:gap-3">
          Kanban AI
        </h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-base sm:text-lg">AI-powered task automation</p>
      </div>
      
      {/* Desktop buttons */}
      <div className="hidden sm:flex gap-3">
        <button
          onClick={onViewAllHistory}
          className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 font-medium shadow-md hover:shadow-lg transition-all"
        >
          <History className="w-5 h-5" />
          View All History
        </button>
        <button
          onClick={onCreateTask}
          className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-black text-white px-6 py-3 rounded-xl hover:from-black-700 hover:to-red-900 font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* Mobile buttons - stacked vertically */}
      <div className="flex sm:hidden flex-col w-full gap-2">
        <button
          onClick={onCreateTask}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-black text-white px-5 py-3 rounded-xl hover:from-black-700 hover:to-red-900 font-medium shadow-lg hover:shadow-xl transition-all w-full"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
        <button
          onClick={onViewAllHistory}
          className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-5 py-3 rounded-xl hover:bg-gray-50 font-medium shadow-md hover:shadow-lg transition-all w-full"
        >
          <History className="w-5 h-5" />
          View All History
        </button>
      </div>
    </div>
  );
}