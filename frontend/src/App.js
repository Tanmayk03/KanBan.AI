import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Loader2, Clock, CheckCircle, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'
);

// Task types configuration
const TASK_TYPES = [
  { value: 'summarize', label: 'Text Summarization', icon: FileText },
  { value: 'translate', label: 'Translation (to Spanish)', icon: Sparkles },
  { value: 'sentiment', label: 'Sentiment Analysis', icon: Sparkles },
  { value: 'code', label: 'Code Generation', icon: Sparkles },
  { value: 'ocr', label: 'Extract Structured Data', icon: Sparkles },
];

// Task Card Component
function TaskCard({ task, isDragging = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'border-blue-300 bg-blue-50';
      case 'in_progress': return 'border-yellow-300 bg-yellow-50';
      case 'done': return 'border-green-300 bg-green-50';
      case 'failed': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const taskType = TASK_TYPES.find(t => t.value === task.task_type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg border-2 shadow-sm cursor-move hover:shadow-md transition-all ${getStatusColor(task.status)}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 flex-1">{task.title}</h3>
        {task.status === 'in_progress' && (
          <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
        )}
        {task.status === 'done' && (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
        {task.status === 'failed' && (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
      )}
      
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        {taskType && <taskType.icon className="w-3 h-3" />}
        <span>{taskType?.label}</span>
      </div>

      {task.input_data?.text && (
        <div className="mt-2 p-2 bg-white rounded text-xs text-gray-600 border border-gray-200">
          <strong>Input:</strong> {task.input_data.text.substring(0, 100)}...
        </div>
      )}

      {task.output_data?.result && (
        <div className="mt-2 p-2 bg-white rounded text-xs text-gray-700 border border-green-200">
          <strong>Output:</strong> {task.output_data.result.substring(0, 150)}...
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        <span>{new Date(task.created_at).toLocaleString()}</span>
      </div>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'column',
      status: id
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'bg-blue-100' : ''}`}
    >
      {children}
    </div>
  );
}

// Column Component
function Column({ title, status, tasks, icon: Icon }) {
  const taskIds = tasks.map(t => t.id);

  return (
    <DroppableColumn id={status}>
      <div className="flex-1 min-w-[320px] bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200">
          <Icon className="w-5 h-5 text-gray-600" />
          <h2 className="font-bold text-lg text-gray-800">{title}</h2>
          <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-semibold">
            {tasks.length}
          </span>
        </div>
        
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[400px]">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                No tasks yet
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </DroppableColumn>
  );
}

// Create Task Modal
function CreateTaskModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'summarize',
    input_text: ''
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.input_text) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    setFormData({ title: '', description: '', task_type: 'summarize', input_text: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g., Summarize quarterly report"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={2}
              placeholder="Optional details about the task"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Task Type *</label>
            <select
              value={formData.task_type}
              onChange={(e) => setFormData({...formData, task_type: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {TASK_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Input Text *</label>
            <textarea
              value={formData.input_text}
              onChange={(e) => setFormData({...formData, input_text: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={5}
              placeholder="Enter the text to process..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
            >
              Create Task
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function KanbanAI() {
  const [tasks, setTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch tasks from Supabase
  useEffect(() => {
    fetchTasks();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('tasks-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks' 
      }, (payload) => {
        console.log('Real-time update:', payload);
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description,
          task_type: formData.task_type,
          status: 'todo',
          input_data: { text: formData.input_text }
        })
        .select()
        .single();

      if (error) throw error;
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + error.message);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find(t => t.id === taskId);

    // If dragging within same column, do nothing
    if (task && task.status === newStatus) {
      return;
    }

    if (task && task.status !== newStatus) {
      // Optimistically update UI
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));

      try {
        const { error } = await supabase
          .from('tasks')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) throw error;

        // Log the status change
        await supabase
          .from('task_logs')
          .insert({
            task_id: taskId,
            event: 'status_changed',
            message: `Status changed from ${task.status} to ${newStatus}`
          });

        console.log(`Task ${taskId} moved to ${newStatus}`);

      } catch (error) {
        console.error('Error updating task:', error);
        // Revert on error
        setTasks(prev => prev.map(t => 
          t.id === taskId ? { ...t, status: task.status } : t
        ));
        alert('Failed to update task status');
      }
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              Kanban AI
            </h1>
            <p className="text-gray-600 mt-1">AI-powered task automation</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            <Column 
              title="To Do" 
              status="todo" 
              tasks={todoTasks}
              icon={FileText}
            />
            <Column 
              title="In Progress" 
              status="in_progress" 
              tasks={inProgressTasks}
              icon={Loader2}
            />
            <Column 
              title="Done" 
              status="done" 
              tasks={doneTasks}
              icon={CheckCircle}
            />
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3">
                <TaskCard task={activeTask} isDragging={true} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTask}
      />
    </div>
  );
}