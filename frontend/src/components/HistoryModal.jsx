import React, { useState, useEffect } from 'react';
import { X, Loader2, History } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function HistoryModal({ isOpen, onClose, task }) {
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
              {logs.map((log) => (
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