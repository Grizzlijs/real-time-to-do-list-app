import React, { useState, memo } from 'react';
import { Task } from '../types';
import { useTodo } from '../context/TodoContext';
import { Draggable, DroppableProvided } from 'react-beautiful-dnd';
import ReactMarkdown from 'react-markdown';
import { Box, TextField, Typography, Checkbox, IconButton, Paper, Collapse, Stack, useTheme, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import MoneyIcon from '@mui/icons-material/MonetizationOn';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { StrictModeDroppable } from './TaskList';

interface TaskItemProps {
  task: Task;
  index: number;
  isSubtask?: boolean;
  parentId: number | null;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, isSubtask = false, parentId }) => {
  const {
    updateTask,
    deleteTask,
    addSubtask
  } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const theme = useTheme();

  const handleToggleComplete = async () => {
    await updateTask(task.id, { is_completed: !task.is_completed });
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateTask(task.id, {
      title: editedTitle,
      description: editedDescription
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || '');
    setIsEditing(false);
  };

  const handleAddSubtask = async () => {
    if (newSubtaskTitle.trim()) {
      await addSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  };

  const getBackgroundColor = () => {
    if (task.is_completed) {
      return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
    }
    return theme.palette.background.paper;
  };

  const subtasks = task.subtasks && task.subtasks.length > 0 && (
    <Collapse in={showSubtasks}>
      <Box sx={{ pl: 4, mt: 1 }}>
        <StrictModeDroppable droppableId={task.id.toString()}>
          {(provided: DroppableProvided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {(task.subtasks || [])
                .sort((a, b) => a.task_order - b.task_order)
                .map((subtask, idx) => (
                  <TaskItem
                    key={`subtask-${subtask.id}`}
                    task={subtask}
                    index={idx}
                    isSubtask={true}
                    parentId={task.id}
                  />
                ))}
              {provided.placeholder}
            </Box>
          )}
        </StrictModeDroppable>
      </Box>
    </Collapse>
  );

  const addSubtaskForm = !isSubtask && isAddingSubtask && (
    <Box sx={{ pl: 4, mt: 1 }}>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Enter subtask title"
          fullWidth
        />
        <IconButton onClick={handleAddSubtask} color="primary">
          <AddIcon />
        </IconButton>
        <IconButton onClick={() => setIsAddingSubtask(false)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    </Box>
  );

  return (
    <Draggable 
      draggableId={`task-${task.id}`} 
      index={index}
    >
      {(provided, snapshot) => (
        <Box 
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{ 
            mb: 1,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
            zIndex: snapshot.isDragging ? 100 : 1,
            willChange: 'transform, box-shadow',
            position: 'relative'
          }}
        >
          <Paper
            elevation={snapshot.isDragging ? 4 : 1} 
            sx={{ 
              p: 1, 
              backgroundColor: getBackgroundColor(),
              borderLeft: task.task_type !== 'basic' ? `4px solid ${task.task_type === 'work-task' ? '#3498db' : '#27ae60'}` : undefined,
              transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
              opacity: task.is_completed ? 0.8 : 1,
              position: 'relative',
              outline: snapshot.isDragging ? `2px solid ${theme.palette.primary.main}` : 'none',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Box 
                {...provided.dragHandleProps}
                sx={{ 
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  pr: 0.5,
                  opacity: 0.5,
                  transition: 'opacity 0.2s ease, color 0.2s ease',
                  '&:hover': { 
                    opacity: 1,
                    color: theme.palette.primary.main 
                  }
                }}
              >
                <DragIndicatorIcon fontSize="small" />
              </Box>
              
              <Checkbox
                checked={task.is_completed}
                onChange={handleToggleComplete}
                color="primary"
              />
              
              {!isEditing ? (
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      color: task.is_completed ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {task.title}
                  </Typography>
                  {task.description && (
                    <Box sx={{ mt: 0.5 }}>
                      <ReactMarkdown>{task.description}</ReactMarkdown>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    multiline
                    rows={2}
                    size="small"
                  />
                </Box>
              )}
              
              <Stack direction="row" spacing={0.5}>
                {!isEditing ? (
                  <>
                    <IconButton size="small" onClick={handleEdit}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleDelete}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton size="small" onClick={handleSave} color="primary">
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancel}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>
            </Stack>
          </Paper>
          
          {subtasks}
          {addSubtaskForm}
          
          {!isSubtask && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              {task.subtasks && task.subtasks.length > 0 && (
                <Tooltip title={showSubtasks ? "Hide subtasks" : "Show subtasks"}>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowSubtasks(!showSubtasks)}
                  >
                    {showSubtasks ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}
              
              {!isAddingSubtask && (
                <Tooltip title="Add subtask">
                  <IconButton 
                    size="small" 
                    onClick={() => setIsAddingSubtask(true)}
                    sx={{ 
                      ml: 'auto',
                      '&:hover': {
                        color: theme.palette.success.main,
                        backgroundColor: 'rgba(0, 200, 83, 0.08)'
                      }
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      )}
    </Draggable>
  );
};

export default memo(TaskItem);
