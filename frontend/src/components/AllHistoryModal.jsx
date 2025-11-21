import React, { useState, useEffect } from 'react';
import { X, Loader2, History } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function AllHistoryModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllLogs();
    }
  }, [isOpen]);

  const fetchAllLogs = async () => {
    setLoading(true);
    try {
      // FIXED: Use getUser() instead of getSession() for more reliable auth checks
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      console.log('=== DEBUG ===');
      console.log('User:', user);

      // 1. Check Authentication
      if (userError || !user) {
        console.error('Authentication error:', userError);
        setLogs([]); // Clear logs if not authenticated
        setLoading(false);
        return;
      }

      const userId = user.id;

      // 2. Get user's task IDs
      const { data: userTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      const taskIds = userTasks?.map(task => task.id) || [];
      
      if (taskIds.length === 0) {
        console.log('No tasks found for user');
        setLogs([]);
        setLoading(false);
        return;
      }

      // 3. Fetch logs for those tasks
      const { data, error } = await supabase
        .from('task_logs')
        .select(`
          *,
          tasks(title)
        `)
        .in('task_id', taskIds)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Logs error:', error);
        throw error;
      }
      
      setLogs(data || []);

    } catch (error) {
      console.error('Error in fetchAllLogs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'status_changed') return log.event === 'status_changed';
    if (filter === 'created') return log.event === 'task_created';
    return true;
  });

  const displayedLogs = showAll ? filteredLogs : filteredLogs.slice(0, 3);

  // --- Helper Functions ---
  const getEventColor = (event) => {
    switch (event) {
      case 'status_changed': return 'border-blue-500';
      case 'task_created': return 'border-green-500';
      case 'task_deleted': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">All Tasks History</h2>
            <p className="text-gray-600 mt-1">Recent activity log</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {['all', 'status_changed', 'created'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors capitalize ${
                filter === f 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        
        {/* Logs List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No history events found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedLogs.map((log) => (
                <div key={log.id} className={`border-l-4 bg-gray-50 rounded-r-lg p-3 ${getEventColor(log.event)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-800">{log.event}</span>
                      {log.tasks && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {log.tasks.title}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{log.message}</p>
                </div>
              ))}
              
              {filteredLogs.length > 3 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAll ? 'Show Less' : `Show ${filteredLogs.length - 3} More Events`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>{filteredLogs.length} events</span>
          <button
            onClick={fetchAllLogs}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}