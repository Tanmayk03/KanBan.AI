import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

export default function Column({ title, status, tasks, icon: Icon, color }) {
  const taskIds = tasks.map(t => t.id);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status: status }
  });

  return (
    <div ref={setNodeRef} className={`transition-all ${isOver ? 'ring-2 ring-blue-400 rounded-xl' : ''}`}>
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
              <TaskCard 
                key={task.id} 
                task={task}
                onDelete={task.onDelete}
                onViewHistory={task.onViewHistory}
              />
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
    </div>
  );
}