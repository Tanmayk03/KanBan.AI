import React, { useState, useEffect } from 'react';
import { X, Loader2, History } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function AllHistoryModal({ isOpen, onClose, tasks }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      fetchAllLogs();
    }
  }, [isOpen]);

  const fetchAllLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_logs')
        .select(`
          *,
          tasks (
            id,
            title,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching all logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'status_changed') return log.event === 'status_changed';
    if (filter === 'created') return log.event === 'created';
    return true;
  });

  const getEventColor = (event) => {
    switch (event) {
      case 'status_changed': return 'border-blue-500';
      case 'created': return 'border-green-500';
      case 'deleted': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">All Tasks History</h2>
            <p className="text-gray-600 mt-1">Complete activity log across all tasks</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('status_changed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'status_changed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Status Changes
          </button>
          <button
            onClick={() => setFilter('created')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'created' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Created
          </button>
        </div>
        
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
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className={`border-l-4 bg-gray-50 rounded-r-lg p-4 ${getEventColor(log.event)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{log.event}</span>
                        {log.tasks && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {log.tasks.title}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{log.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredLogs.length} of {logs.length} events</span>
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