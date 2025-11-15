import React from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { FileText, Loader2, CheckCircle } from 'lucide-react';
import Column from './Column';
import TaskCard from './TaskCard';

export default function KanbanBoard({ tasks, onDelete, onViewHistory, onDragStart, onDragEnd, activeTask }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        <Column 
          title="To Do" 
          status="todo" 
          tasks={todoTasks.map(t => ({ ...t, onDelete, onViewHistory }))}
          icon={FileText}
          color="#3b82f6"
        />
        <Column 
          title="In Progress" 
          status="in_progress" 
          tasks={inProgressTasks.map(t => ({ ...t, onDelete, onViewHistory }))}
          icon={Loader2}
          color="#f59e0b"
        />
        <Column 
          title="Done" 
          status="done" 
          tasks={doneTasks.map(t => ({ ...t, onDelete, onViewHistory }))}
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
  );
}