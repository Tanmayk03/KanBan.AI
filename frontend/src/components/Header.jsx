import React from 'react';
import { Plus, Sparkles, History } from 'lucide-react';

export default function Header({ onCreateTask, onViewAllHistory }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-l from-gray-600 to-black bg-clip-text hover:from-black-700 hover:to-red-900 text-transparent flex items-center gap-3">
       Kanban AI
        </h1>
        <p className="text-gray-600 mt-2 text-lg">AI-powered task automation</p>
      </div>
      <div className="flex gap-3">
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
          <Plus className="w-5 h-5 " />
          New Task
        </button>
      </div>
    </div>
  );
}