import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TASK_TYPES } from '../constants/taskTypes';

export default function CreateTaskModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'summarize',
    input_text: ''
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.input_text) {
      alert('Please fill in title and input text');
      return;
    }
    onSubmit(formData);
    setFormData({ title: '', description: '', task_type: 'summarize', input_text: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Task</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Task Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="e.g., Summarize quarterly report"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
              rows={2}
              placeholder="Optional details"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Task Type</label>
            <select
              value={formData.task_type}
              onChange={(e) => setFormData({...formData, task_type: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
            >
              {TASK_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Input Text</label>
            <textarea
              value={formData.input_text}
              onChange={(e) => setFormData({...formData, input_text: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
              rows={4}
              placeholder="Enter text to process..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg transition-all"
            >
              Create Task
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}