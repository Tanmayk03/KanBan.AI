import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './config/supabase';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import CreateTaskModal from './components/CreateTaskModal';
import HistoryModal from './components/HistoryModal';
import AllHistoryModal from './components/AllHistoryModal';

export default function KanbanAI() {
  const [tasks, setTasks] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModal, setHistoryModal] = useState({ isOpen: false, task: null });
  const [allHistoryModalOpen, setAllHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
        <Header 
          onCreateTask={() => setIsModalOpen(true)}
          onViewAllHistory={() => setAllHistoryModalOpen(true)}
        />
        
        <KanbanBoard
          tasks={tasks}
          onDelete={deleteTask}
          onViewHistory={(task) => setHistoryModal({ isOpen: true, task })}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          activeTask={activeTask}
        />
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

      <AllHistoryModal
        isOpen={allHistoryModalOpen}
        onClose={() => setAllHistoryModalOpen(false)}
        tasks={tasks}
      />
    </div>
  );
}