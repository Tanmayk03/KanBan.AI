import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader2, Clock, CheckCircle, Trash2, History, FileText, X } from 'lucide-react';
import { TASK_TYPES } from '../constants/taskTypes';

export default function TaskCard({ task, isDragging = false, onDelete, onViewHistory }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'todo': return 'bg-white border-blue-300';
      case 'in_progress': return 'bg-white border-amber-300';
      case 'done': return 'bg-white border-emerald-300';
      case 'failed': return 'bg-white border-red-300';
      default: return 'bg-white border-gray-300';
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'todo': return 'bg-blue-500';
      case 'in_progress': return 'bg-amber-500';
      case 'done': return 'bg-emerald-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const taskType = TASK_TYPES.find(t => t.value === task.task_type);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative rounded-lg border-2 shadow-sm hover:shadow-md transition-all ${getStatusStyle(task.status)}`}
      >
        {/* Status Indicator Bar */}
        <div className={`h-1 rounded-t-lg ${getStatusIndicator(task.status)}`}></div>
        
        <div {...attributes} {...listeners} className="p-4 cursor-move">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{task.title}</h3>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewHistory(task);
                }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
                title="History"
              >
                <History className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              {taskType && <taskType.icon className="w-3 h-3" />}
              <span>{taskType?.label}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailsModal(true);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View →
            </button>
          </div>
        </div>
      </div>

      {/* Clean Details Modal */}
      {showDetailsModal && (
        <TaskDetailsModal 
          task={task} 
          taskType={taskType}
          onClose={() => setShowDetailsModal(false)}
          onViewHistory={() => {
            setShowDetailsModal(false);
            onViewHistory(task);
          }}
        />
      )}
    </>
  );
}

// Task Details Modal Component
function TaskDetailsModal({ task, taskType, onClose, onViewHistory }) {
  const [activeTab, setActiveTab] = useState('input');

  const inputText = task.input_data?.text || '';
  const outputText = task.output_data?.result || '';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                {taskType && (
                  <div className="flex items-center gap-1.5">
                    <taskType.icon className="w-4 h-4" />
                    <span>{taskType.label}</span>
                  </div>
                )}
                <span>•</span>
                <span>{new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'input'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Input
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'output'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Output
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Info
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'input' && (
            <div>
              {inputText ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-sans leading-relaxed">
                    {inputText}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No input data</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'output' && (
            <div>
              {outputText ? (
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-sans leading-relaxed">
                    {outputText}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No output yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              {task.description && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                  <p className="mt-1 text-sm text-gray-800">{task.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                  <p className="mt-1 text-sm font-medium text-gray-800 capitalize">
                    {task.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task Type</label>
                  <p className="mt-1 text-sm text-gray-800">{taskType?.label}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</label>
                  <p className="mt-1 text-sm text-gray-800">
                    {new Date(task.created_at).toLocaleString()}
                  </p>
                </div>
                {task.updated_at && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Updated</label>
                    <p className="mt-1 text-sm text-gray-800">
                      {new Date(task.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task ID</label>
                <p className="mt-1 text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                  {task.id}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onViewHistory}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            View History
          </button>
          <button
            onClick={onClose}
            className="px-9 py-2.5 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}