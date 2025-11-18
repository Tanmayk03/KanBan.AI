import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

// Droppable Column Component
function DroppableColumn({ id, title, count, color, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={`bg-white rounded-lg shadow-lg p-4 transition-all ${
        isOver ? 'ring-4 ring-blue-400 bg-blue-50' : ''
      }`}
    >
      <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${color}`}>
        {title} ({count})
      </h2>
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// Draggable Task Wrapper
function DraggableTask({ task, onDelete, onViewHistory }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard 
        task={task} 
        onDelete={onDelete}
        onViewHistory={onViewHistory}
      />
    </div>
  );
}

export default function KanbanBoard({ tasks, onDelete, onViewHistory }) {
  
  const groupTasksByStatus = () => {
    return {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      done: tasks.filter(t => t.status === 'done'),
      failed: tasks.filter(t => t.status === 'failed')
    };
  };

  const grouped = groupTasksByStatus();

  return (
    <div className="max-w-7xl mx-auto mt-8">
      {/* Main Grid: To Do, In Progress, Done */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* To Do Column */}
        <DroppableColumn
          id="todo"
          title="To Do"
          count={grouped.todo.length}
          color="text-gray-700"
        >
          {grouped.todo.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No tasks yet</p>
          ) : (
            grouped.todo.map(task => (
              <DraggableTask 
                key={task.id} 
                task={task} 
                onDelete={onDelete}
                onViewHistory={onViewHistory}
              />
            ))
          )}
        </DroppableColumn>

        {/* In Progress Column */}
        <DroppableColumn
          id="in_progress"
          title="In Progress"
          count={grouped.in_progress.length}
          color="text-yellow-700"
        >
          {grouped.in_progress.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No tasks processing</p>
          ) : (
            grouped.in_progress.map(task => (
              <DraggableTask 
                key={task.id} 
                task={task} 
                onDelete={onDelete}
                onViewHistory={onViewHistory}
              />
            ))
          )}
        </DroppableColumn>

        {/* Done Column */}
        <DroppableColumn
          id="done"
          title="Done"
          count={grouped.done.length}
          color="text-green-700"
        >
          {grouped.done.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No completed tasks</p>
          ) : (
            grouped.done.map(task => (
              <DraggableTask 
                key={task.id} 
                task={task} 
                onDelete={onDelete}
                onViewHistory={onViewHistory}
              />
            ))
          )}
        </DroppableColumn>
      </div>

      {/* Failed Section - Smaller, Collapsible */}
      {grouped.failed.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <DroppableColumn
            id="failed"
            title="Failed Tasks"
            count={grouped.failed.length}
            color="text-red-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {grouped.failed.map(task => (
                <DraggableTask 
                  key={task.id} 
                  task={task} 
                  onDelete={onDelete}
                  onViewHistory={onViewHistory}
                />
              ))}
            </div>
          </DroppableColumn>
        </div>
      )}
    </div>
  );
}