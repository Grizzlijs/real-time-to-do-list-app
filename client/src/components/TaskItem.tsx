import React, { useState } from 'react';
import { Task } from '../types';
import { useTodo } from '../context/TodoContext';
import { Draggable } from 'react-beautiful-dnd';
import ReactMarkdown from 'react-markdown';
import { Box, TextField, Typography, Checkbox, IconButton, Paper, Collapse, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import MoneyIcon from '@mui/icons-material/MonetizationOn';

interface TaskItemProps {
  task: Task;
  index: number;
  isSubtask?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, isSubtask = false }) => {
  const {
    updateTaskCompletion,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskCost,
    deleteTask,
    createTask
  } = useTodo();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditingCost, setIsEditingCost] = useState(false);
  const [editCost, setEditCost] = useState(task.cost?.toString() || '');

  const handleToggleComplete = () => {
    updateTaskCompletion(task.id, !task.is_completed);
  };

  const handleEditSave = () => {
    if (editTitle.trim()) {
      updateTaskTitle(task.id, editTitle);
      updateTaskDescription(task.id, editDescription);
      setIsEditing(false);
    }
  };

  const handleCostSave = () => {
    const costValue = editCost ? parseFloat(editCost) : null;
    updateTaskCost(task.id, costValue);
    setIsEditingCost(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isEditing) handleEditSave();
      else if (isEditingCost) handleCostSave();
      else if (isAddingSubtask) handleAddSubtask();
    }
    if (e.key === 'Escape') {
      if (isEditing) {
        setEditTitle(task.title);
        setEditDescription(task.description || '');
        setIsEditing(false);
      } else if (isEditingCost) {
        setEditCost(task.cost?.toString() || '');
        setIsEditingCost(false);
      } else if (isAddingSubtask) {
        setNewSubtaskTitle('');
        setIsAddingSubtask(false);
      }
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      createTask(newSubtaskTitle, task.id);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  };

  // Assign task color based on type
  const getTaskTypeColor = () => {
    switch (task.task_type) {
      case 'work-task':
        return '#ecf0f1';
      case 'food':
        return '#e8f5e9';
      default:
        return 'white';
    }
  };

  const taskContentDisplay = (
    <>
      {!isEditing ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
          <Checkbox
            checked={task.is_completed}
            onChange={handleToggleComplete}
            color="primary"
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: task.is_completed ? 'line-through' : 'none',
                color: task.is_completed ? 'text.secondary' : 'text.primary',
                wordBreak: 'break-word'
              }}
            >
              {task.title}
            </Typography>
          </Box>
          
          {/* Cost display (or editing UI) */}
          {(task.cost || task.totalCost || isEditingCost) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <MoneyIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              {isEditingCost ? (
                <TextField
                  size="small"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                  onBlur={handleCostSave}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  type="number"
                  inputProps={{ step: 0.01 }}
                  sx={{ width: '80px' }}
                />
              ) : (
                <Typography
                  variant="body2"
                  onClick={() => setIsEditingCost(true)}
                  sx={{ cursor: 'pointer' }}
                >
                  ${task.totalCost ? task.totalCost.toFixed(2) : task.cost?.toFixed(2)}
                </Typography>
              )}
            </Box>
          )}
          
          <Stack direction="row">
            {task.description && (
              <IconButton
                size="small"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            
            <IconButton size="small" onClick={() => setIsEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
            
            <IconButton size="small" onClick={() => deleteTask(task.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      ) : (
        <Box sx={{ width: '100%', p: 1 }}>
          <TextField
            fullWidth
            label="Task Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            margin="dense"
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <TextField
            fullWidth
            label="Description (markdown supported)"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            margin="dense"
            multiline
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                setEditDescription(
                  editDescription.substring(0, start) + '  ' + editDescription.substring(end)
                );
                setTimeout(() => {
                  e.currentTarget.selectionStart = start + 2;
                  e.currentTarget.selectionEnd = start + 2;
                }, 0);
              }
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TextField
              label="Cost"
              type="number"
              size="small"
              inputProps={{ step: 0.01 }}
              value={editCost}
              onChange={(e) => setEditCost(e.target.value)}
              sx={{ width: '150px', mr: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
              <IconButton onClick={() => {
                setEditTitle(task.title);
                setEditDescription(task.description || '');
                setEditCost(task.cost?.toString() || '');
                setIsEditing(false);
              }}>
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={handleEditSave} color="primary">
                <EditIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );

  // Render markdown description if expanded
  const taskDescription = isDescriptionExpanded && task.description && (
    <Box sx={{ px: 3, py: 1, backgroundColor: '#f9f9f9' }}>
      <ReactMarkdown>{task.description}</ReactMarkdown>
    </Box>
  );

  // Render subtasks if they exist
  const subtasks = task.subtasks && task.subtasks.length > 0 && (
    <Collapse in={showSubtasks}>
      <Box sx={{ pl: 4 }}>
        {task.subtasks.map((subtask, subtaskIndex) => (
          <TaskItem 
            key={subtask.id} 
            task={subtask} 
            index={subtaskIndex} 
            isSubtask={true} 
          />
        ))}
      </Box>
    </Collapse>
  );

  // Add subtask form
  const addSubtaskForm = isAddingSubtask && (
    <Box sx={{ pl: 4, py: 1 }}>
      <Paper elevation={0} sx={{ p: 1, backgroundColor: '#f5f5f5' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="New subtask..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <IconButton size="small" onClick={() => setIsAddingSubtask(false)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleAddSubtask} 
            color="primary" 
            disabled={!newSubtaskTitle.trim()}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Draggable draggableId={`task-${task.id}`} index={index} isDragDisabled={isSubtask}>
      {(provided) => (
        <Box 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ mb: 1 }}
        >
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              backgroundColor: getTaskTypeColor(),
              borderLeft: task.task_type !== 'basic' ? `4px solid ${task.task_type === 'work-task' ? '#3498db' : '#27ae60'}` : undefined,
            }}
          >
            {taskContentDisplay}
            {taskDescription}

            {/* Subtask controls */}
            {!isSubtask && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                {/* Toggle subtasks visibility if there are subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <IconButton 
                    size="small" 
                    onClick={() => setShowSubtasks(!showSubtasks)}
                  >
                    {showSubtasks ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                )}
                
                {/* Add subtask button */}
                {!isAddingSubtask && (
                  <IconButton 
                    size="small" 
                    onClick={() => setIsAddingSubtask(true)}
                    sx={{ ml: 'auto' }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}
          </Paper>
          
          {subtasks}
          {addSubtaskForm}
        </Box>
      )}
    </Draggable>
  );
};

export default TaskItem;
