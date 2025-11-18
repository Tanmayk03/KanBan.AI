import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'auto',
    input_text: ''
  });

  const taskTypes = [
    { 
      value: 'auto', 
      label: 'Auto Detect', 
      description: 'Let AI choose the best workflow' 
    },
    { 
      value: 'summarize', 
      label: 'Summarize', 
      description: 'Condense long text' 
    },
    { 
      value: 'translate', 
      label: 'Translate', 
      description: 'Convert to another language' 
    },
    { 
      value: 'sentiment', 
      label: 'Sentiment', 
      description: 'Analyze emotions' 
    },
    { 
      value: 'code', 
      label: 'Code', 
      description: 'Generate or fix code' 
    },
    { 
      value: 'ocr', 
      label: 'Document', 
      description: 'Extract information' 
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      task_type: 'auto',
      input_text: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black text-white p-6 flex items-center justify-between hover:from-black-700 hover:to-red-900 text">
          <h2 className="text-2xl font-bold">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Fix authentication bug in login system"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-800 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the task"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-800 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
            />
          </div>

          {/* Task Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Task Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {taskTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, task_type: type.value })}
                  className={`
                    p-3 rounded-xl font-medium transition-all text-left border-2
                    ${formData.task_type === type.value
                      ? 'bg-gradient-to-br from-gray-800 to-black text-white border-gray-900 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-md hover:bg-gradient-to-br hover:from-black hover:to-red-900 hover:text-white'
                    }
                  `}
                >
                  <div className="font-bold text-sm mb-0.5">{type.label}</div>
                  <div className={`text-xs ${formData.task_type === type.value ? 'text-gray-300' : 'text-gray-500'}`}>
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
            
            {formData.task_type === 'auto' && (
              <div className="mt-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">AI Auto-Detection:</span> The system will automatically analyze your task and choose the best workflow type
                </p>
              </div>
            )}
          </div>

          {/* Input Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Input Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.input_text}
              onChange={(e) => setFormData({ ...formData, input_text: e.target.value })}
              placeholder="Enter the text or details for AI to process..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-800 focus:ring-2 focus:ring-gray-200 transition-all outline-none resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide detailed information for better AI processing
            </p>
          </div>
        </form>

        {/* Footer Buttons - Fixed at bottom */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg font-semibold hover:from-black hover:to-red-900 transition-all shadow-lg hover:shadow-xl"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}