import React, { useState } from 'react';
import { Trash2, Clock, History, Calendar, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function TaskCard({ task, onDelete, onViewHistory }) {
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const workflowBadges = {
    'summarization': { color: 'bg-blue-100 text-blue-800', label: 'Summarization' },
    'translation': { color: 'bg-green-100 text-green-800', label: 'Translation' },
    'sentiment-analysis': { color: 'bg-yellow-100 text-yellow-800', label: 'Sentiment' },
    'code-generation': { color: 'bg-pink-100 text-pink-800', label: 'Code Gen' },
    'code-explanation': { color: 'bg-indigo-100 text-indigo-800', label: 'Code Explain' },
    'bug-fix': { color: 'bg-red-100 text-red-800', label: 'Bug Fix' },
    'document-analysis': { color: 'bg-purple-100 text-purple-800', label: 'Doc Analysis' },
    'content-polishing': { color: 'bg-cyan-100 text-cyan-800', label: 'Polish' },
    'creative-writing': { color: 'bg-orange-100 text-orange-800', label: 'Creative' },
    'research': { color: 'bg-teal-100 text-teal-800', label: 'Research' }
  };

  const taskTypeColors = {
    'summarize': 'bg-blue-100 text-blue-800',
    'translate': 'bg-green-100 text-green-800',
    'sentiment': 'bg-yellow-100 text-yellow-800',
    'code': 'bg-pink-100 text-pink-800',
    'ocr': 'bg-purple-100 text-purple-800',
    'auto': 'bg-gray-100 text-gray-800'
  };

  const workflowBadge = workflowBadges[task.detected_workflow];
  const taskTypeColor = taskTypeColors[task.task_type] || 'bg-gray-100 text-gray-800';

  const handleOutputClick = (e) => {
    e.stopPropagation(); // Prevent drag from triggering
    setIsOutputExpanded(!isOutputExpanded);
  };

  const handleButtonClick = (e, callback) => {
    e.stopPropagation(); // Prevent drag from triggering
    callback();
  };

  const handleCopyOutput = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(task.output_data.result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100">
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
            {task.title}
          </h3>
          
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-2">
            {/* Task Type Badge */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${taskTypeColor}`}>
              {task.task_type === 'auto' ? 'Auto' : task.task_type}
            </span>

            {/* Detected Workflow Badge (if available) */}
            {workflowBadge && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${workflowBadge.color}`}>
                {workflowBadge.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Input Preview */}
      {task.input_data?.text && (
        <div className="bg-gray-50 p-3 rounded-lg mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">Input:</p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {task.input_data.text}
          </p>
        </div>
      )}

      {/* Output/Result - Clickable and Expandable */}
      {task.output_data?.result && (
        <div 
          className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg mb-3 border border-green-100 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-green-700">Result:</p>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyOutput}
                className="p-1 hover:bg-green-100 rounded transition-colors group"
                title="Copy output"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-green-600 group-hover:text-green-700" />
                )}
              </button>
              <button
                onClick={handleOutputClick}
                className="p-1 hover:bg-green-100 rounded transition-colors"
              >
                {isOutputExpanded ? (
                  <ChevronUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-green-600" />
                )}
              </button>
            </div>
          </div>
          <p className={`text-sm text-gray-700 whitespace-pre-wrap ${isOutputExpanded ? '' : 'line-clamp-3'}`}>
            {task.output_data.result}
          </p>
          {!isOutputExpanded && task.output_data.result.length > 150 && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              Click expand to view full output
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {task.output_data?.error && (
        <div className="bg-red-50 p-3 rounded-lg mb-3 border border-red-200">
          <p className="text-xs font-semibold text-red-600 mb-1">Error:</p>
          <p className="text-sm text-red-700 line-clamp-2">
            {task.output_data.error}
          </p>
        </div>
      )}

      {/* Footer Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {/* Processing Time */}
          {task.output_data?.processing_time_ms && (
            <span className="flex items-center gap-1" title="Processing Time">
              <Clock className="w-3 h-3" />
              {task.output_data.processing_time_ms}ms
            </span>
          )}

          {/* Created Date */}
          <span className="flex items-center gap-1" title="Created">
            <Calendar className="w-3 h-3" />
            {new Date(task.created_at).toLocaleDateString()}
          </span>

          {/* Model Info */}
          {task.output_data?.model && (
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
              {task.output_data.model}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleButtonClick(e, () => onViewHistory(task))}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group"
            title="View History"
          >
            <History className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
          </button>
          <button
            onClick={(e) => handleButtonClick(e, () => onDelete(task.id))}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}