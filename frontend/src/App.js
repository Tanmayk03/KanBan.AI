import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Loader2, Clock, CheckCircle, FileText, Sparkles, Trash2, History, X } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'
);

const TASK_TYPES = [
  { value: 'summarize', label: 'Text Summarization', icon: FileText },
  { value: 'translate', label: 'Translation', icon: Sparkles },
  { value: 'sentiment', label: 'Sentiment Analysis', icon: Sparkles },
  { value: 'code', label: 'Code Generation', icon: Sparkles },
  { value: 'ocr', label: 'Extract Data', icon: Sparkles },
];

function TaskCard({ task, isDragging = false, onDelete, onViewHistory }) {
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
      case 'todo': return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200';
      case 'in_progress': return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';
      case 'done': return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200';
      case 'failed': return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200';
      default: return 'bg-white border-gray-200';
    }
  };

  const taskType = TASK_TYPES.find(t => t.value === task.task_type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border-2 shadow-sm hover:shadow-lg transition-all ${getStatusStyle(task.status)}`}
    >
      <div {...attributes} {...listeners} className="p-4 cursor-move">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 flex-1 pr-2">{task.title}</h3>
          {task.status === 'in_progress' && (
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 flex-shrink-0" />
          )}
          {task.status === 'done' && (
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {taskType && <taskType.icon className="w-3 h-3" />}
          <span>{taskType?.label}</span>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewHistory(task);
          }}
          className="p-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="View history"
        >
          <History className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="p-1.5 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      <div className="px-4 pb-3 flex items-center gap-1 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        <span>{new Date(task.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function DroppableColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: { type: 'column', status: id }
  });

  return (
    <div ref={setNodeRef} className={`transition-all ${isOver ? 'ring-2 ring-blue-400 rounded-xl' : ''}`}>
      {children}
    </div>
  );
}

function Column({ title, status, tasks, icon: Icon, color }) {
  const taskIds = tasks.map(t => t.id);

  return (
    <DroppableColumn id={status}>
      <div className="flex-1 min-w-[300px] bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: color }}>
          <Icon className="w-5 h-5" style={{ color }} />
          <h2 className="font-bold text-lg text-gray-800">{title}</h2>
          <span className="ml-auto px-2.5 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: color }}>
            {tasks.length}
          </span>
        </div>
        
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[400px]">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-gray-400 py-16">
                <Icon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No tasks</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </DroppableColumn>
  );
}

function CreateTaskModal({ isOpen, onClose, onSubmit }) {
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

function HistoryModal({ isOpen, onClose, task }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && task) {
      fetchLogs();
    }
  }, [isOpen, task]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_logs')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Task History</h2>
            <p className="text-gray-600 mt-1">{task?.title}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={log.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-4">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-gray-800">{log.event}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KanbanAI() {
  const [tasks, setTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModal, setHistoryModal] = useState({ isOpen: false, task: null });
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    fetchTasks();
    
    const subscription = supabase
      .channel('tasks-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
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
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description,
          task_type: formData.task_type,
          status: 'todo',
          input_data: { text: formData.input_text }
        });

      if (error) throw error;
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + error.message);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
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

    if (task && task.status !== newStatus) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      try {
        const { error } = await supabase
          .from('tasks')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', taskId);

        if (error) throw error;

        await supabase
          .from('task_logs')
          .insert({
            task_id: taskId,
            event: 'status_changed',
            message: `Status changed from ${task.status} to ${newStatus}`
          });

      } catch (error) {
        console.error('Error updating task:', error);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t));
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-blue-600" />
              Kanban AI
            </h1>
            <p className="text-gray-600 mt-2 text-lg">AI-powered task automation</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg hover:shadow-xl transition-all"
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
              tasks={todoTasks.map(t => ({ ...t, onDelete: deleteTask, onViewHistory: (task) => setHistoryModal({ isOpen: true, task }) }))}
              icon={FileText}
              color="#3b82f6"
            />
            <Column 
              title="In Progress" 
              status="in_progress" 
              tasks={inProgressTasks.map(t => ({ ...t, onDelete: deleteTask, onViewHistory: (task) => setHistoryModal({ isOpen: true, task }) }))}
              icon={Loader2}
              color="#f59e0b"
            />
            <Column 
              title="Done" 
              status="done" 
              tasks={doneTasks.map(t => ({ ...t, onDelete: deleteTask, onViewHistory: (task) => setHistoryModal({ isOpen: true, task }) }))}
              icon={CheckCircle}
              color="#10b981"
            />
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 scale-105">
                <TaskCard task={activeTask} isDragging={true} onDelete={() => {}} onViewHistory={() => {}} />
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

      <HistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ isOpen: false, task: null })}
        task={historyModal.task}
      />
    </div>
  );
}