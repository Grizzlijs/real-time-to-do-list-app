import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, IconButton, Typography, Stack, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { Task } from '../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTodo } from '../context/TodoContext';

interface TaskModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

type SubtaskItemProps = {
  subtask: Task;
  level: number;
  openMap: { [id: number]: boolean };
  toggleOpen: (id: number) => void;
  handleSubtaskToggle: (id: number, isCompleted: boolean) => void;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
};

type SubtaskListProps = {
  subtasks: Task[];
  level?: number;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  openMap: { [id: number]: boolean };
  toggleOpen: (id: number) => void;
  handleSubtaskToggle: (id: number, isCompleted: boolean) => void;
};

const TaskModal: React.FC<TaskModalProps> = ({ open, task, onClose }) => {
  const { updateTask, reorderTasks, tasks, getTaskHierarchy, addSubtask, deleteTask } = useTodo();
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [openMap, setOpenMap] = useState<{ [id: number]: boolean }>({});
  const [editingDescriptions, setEditingDescriptions] = useState<{ [id: number]: boolean }>({});
  const [tempDescriptions, setTempDescriptions] = useState<{ [id: number]: string }>({});
  const mainDescriptionRef = useRef<HTMLInputElement>(null);
  const subtaskDescriptionRefs = useRef<{ [id: number]: HTMLInputElement | null }>({});
  const [editingMainDescription, setEditingMainDescription] = useState(false);
  const [mainDescriptionDraft, setMainDescriptionDraft] = useState('');
  const [subtaskDescriptionDrafts, setSubtaskDescriptionDrafts] = useState<{ [id: number]: string }>({});
  const [isAddingRootSubtask, setIsAddingRootSubtask] = useState(false);
  const [newRootSubtaskTitle, setNewRootSubtaskTitle] = useState('');
  const [isSubmittingRootSubtask, setIsSubmittingRootSubtask] = useState(false);

  // Memoize taskHierarchy to avoid recalculating on every render
  const taskHierarchy = useMemo(() => getTaskHierarchy(), [tasks]);

  const findTaskInHierarchy = useCallback((tasks: Task[], targetId: number): Task | null => {
    for (const t of tasks) {
      if (t.id === targetId) return t;
      if (t.subtasks) {
        const found = findTaskInHierarchy(t.subtasks, targetId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Helper for deep equality check (shallow for our use case)
  function shallowEqual(obj1: any, obj2: any) {
    if (!obj1 || !obj2) return false;
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) return false;
    }
    return true;
  }

  // Update local task when task prop changes or when modal is opened
  useEffect(() => {
    if (open && task) {
      const foundTask = findTaskInHierarchy(taskHierarchy, task.id);
      if (foundTask) {
        setLocalTask(foundTask);
      }
    } else if (!open) {
      setLocalTask(null);
    }
  }, [open, task, taskHierarchy, findTaskInHierarchy, tasks]);

  // Initialize openMap with all subtasks expanded when task changes
  useEffect(() => {
    if (localTask?.subtasks) {
      const newOpenMap = { ...openMap };
      const initializeOpenMap = (tasks: Task[]) => {
        tasks.forEach(t => {
          if (t.subtasks && t.subtasks.length > 0) {
            newOpenMap[t.id] = true; // Start expanded
            initializeOpenMap(t.subtasks);
          }
        });
      };
      initializeOpenMap(localTask.subtasks);
      setOpenMap(newOpenMap);
    }
  }, [localTask?.id]);

  // When entering edit mode, set the draft to the current description
  useEffect(() => {
    if (editingMainDescription && localTask) {
      setMainDescriptionDraft(localTask.description || '');
    }
  }, [editingMainDescription, localTask]);

  // Focus main description input when editing starts
  useEffect(() => {
    if (editingMainDescription && mainDescriptionRef.current) {
      mainDescriptionRef.current.focus();
    }
  }, [editingMainDescription]);

  // Focus subtask description input when editing starts
  useEffect(() => {
    Object.keys(editingDescriptions).forEach(idStr => {
      const id = Number(idStr);
      if (editingDescriptions[id] && subtaskDescriptionRefs.current[id]) {
        subtaskDescriptionRefs.current[id]?.focus();
      }
    });
  }, [editingDescriptions]);

  const handleSave = async () => {
    if (!localTask) return;
    const updates: any = {
      title: localTask.title,
      description: localTask.description,
      task_type: localTask.task_type,
    };
    if (localTask.task_type === 'work-task') {
      updates.deadline = localTask.deadline;
    } else if (localTask.task_type === 'food') {
      updates.carbohydrate = localTask.carbohydrate;
      updates.protein = localTask.protein;
      updates.fat = localTask.fat;
      updates.picture = localTask.picture;
    }
    await updateTask(localTask.id, updates);
    onClose();
  };

  const handleSubtaskToggle = async (subtaskId: number, isCompleted: boolean) => {
    await updateTask(subtaskId, { is_completed: isCompleted });
  };

  const toggleOpen = (id: number) => {
    setOpenMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartEditing = (taskId: number, currentDescription: string) => {
    setEditingDescriptions(prev => ({ ...prev, [taskId]: true }));
    setSubtaskDescriptionDrafts(prev => ({ ...prev, [taskId]: currentDescription }));
  };

  const handleSaveDescription = async (taskId: number) => {
    const newDescription = subtaskDescriptionDrafts[taskId] || '';
    await updateTask(taskId, { description: newDescription });
    setEditingDescriptions(prev => ({ ...prev, [taskId]: false }));
    setSubtaskDescriptionDrafts(prev => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
    // Update local task state
    if (localTask) {
      const updateTaskInTree = (tasks: Task[]): Task[] => {
        return tasks.map(t => {
          if (t.id === taskId) {
            return { ...t, description: newDescription };
          }
          if (t.subtasks) {
            return { ...t, subtasks: updateTaskInTree(t.subtasks) };
          }
          return t;
        });
      };
      if (localTask.id === taskId) {
        setLocalTask(prev => prev ? { ...prev, description: newDescription } : null);
      } else if (localTask.subtasks) {
        setLocalTask(prev => prev ? { ...prev, subtasks: updateTaskInTree(prev.subtasks || []) } : null);
      }
    }
  };

  const handleCancelEditing = (taskId: number) => {
    setEditingDescriptions(prev => ({ ...prev, [taskId]: false }));
    setSubtaskDescriptionDrafts(prev => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
  };

  const handleTitleChange = (newTitle: string) => {
    if (localTask) {
      setLocalTask(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const handleAddRootSubtask = async () => {
    if (localTask && newRootSubtaskTitle.trim()) {
      setIsSubmittingRootSubtask(true);
      try {
        await addSubtask(localTask.id, newRootSubtaskTitle);
        setNewRootSubtaskTitle('');
        setIsAddingRootSubtask(false);
      } finally {
        setIsSubmittingRootSubtask(false);
      }
    }
  };

  const handleRootSubtaskFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddRootSubtask();
  };

  // Memoized SubtaskItem
  const SubtaskItem: React.FC<SubtaskItemProps> = memo(({ subtask, level, openMap, toggleOpen, handleSubtaskToggle, updateTask }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(subtask.description || '');
    const inputRef = useRef<HTMLInputElement>(null);
    // Add subtask state
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);

    useEffect(() => {
      if (editing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [editing]);

    useEffect(() => {
      setDraft(subtask.description || '');
    }, [subtask.description]);

    const handleAddSubtask = async () => {
      if (newSubtaskTitle.trim()) {
        setIsSubmittingSubtask(true);
        try {
          await updateTask(subtask.id, { title: newSubtaskTitle });
          setNewSubtaskTitle('');
          setIsAddingSubtask(false);
        } finally {
          setIsSubmittingSubtask(false);
        }
      }
    };

    const handleSubtaskFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddSubtask();
    };

    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-start',
        background: '#fafbfc',
        borderRadius: 1,
        p: { xs: 0.5, sm: 1 },
        fontSize: { xs: '0.95rem', sm: '1rem' },
        mb: 0.5,
        borderBottom: '1px solid #f0f0f0',
        boxShadow: 0,
        minHeight: 44,
        flexDirection: 'column',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {subtask.subtasks && subtask.subtasks.length > 0 ? (
            <IconButton size="small" onClick={() => toggleOpen(subtask.id)} sx={{ mr: 1, mt: 0.5 }}>
              {openMap[subtask.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          ) : (
            <Box sx={{ width: 32, mr: 1 }} />
          )}
          <Checkbox checked={subtask.is_completed} sx={{ mr: 1, mt: 0.5 }} onChange={() => handleSubtaskToggle(subtask.id, !subtask.is_completed)} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 500, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtask.title}</Typography>
            {editing ? (
              <Box sx={{ mt: 1 }}>
                <TextField
                  multiline
                  rows={2}
                  value={draft}
                  inputRef={inputRef}
                  onChange={e => setDraft(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton size="small" onClick={async () => {
                    await updateTask(subtask.id, { description: draft });
                    setEditing(false);
                  }} color="primary">
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setEditing(false)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={async () => { await deleteTask(subtask.id); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.25 }}>
                <Typography variant="caption" color="text.secondary" sx={{
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                }}>
                  {subtask.description || 'No description'}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1 }}>
                  <IconButton size="small" onClick={() => setEditing(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={async () => { await deleteTask(subtask.id); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setIsAddingSubtask(true)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
        {/* Add Subtask Input */}
        {isAddingSubtask && (
          <Box sx={{ width: '100%', mt: 1, pl: 5 }}>
            <form onSubmit={handleSubtaskFormSubmit} style={{ width: '100%' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size={window.innerWidth < 600 ? 'medium' : 'small'}
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                  placeholder="Enter subtask title"
                  fullWidth
                  disabled={isSubmittingSubtask}
                  autoFocus
                />
                <IconButton
                  onClick={handleAddSubtask}
                  color="primary"
                  disabled={isSubmittingSubtask || !newSubtaskTitle.trim()}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  onClick={() => setIsAddingSubtask(false)}
                  disabled={isSubmittingSubtask}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </form>
          </Box>
        )}
      </Box>
    );
  });

  // Memoized SubtaskList
  const SubtaskList: React.FC<SubtaskListProps> = memo(({ subtasks, level = 0, updateTask, openMap, toggleOpen, handleSubtaskToggle }) => {
    if (!subtasks || subtasks.length === 0) return null;
    return (
      <Stack spacing={0.5} sx={{ pl: level * 2 }}>
        {subtasks.map((subtask) => (
          <React.Fragment key={subtask.id}>
            <SubtaskItem
              subtask={subtask}
              level={level}
              openMap={openMap}
              toggleOpen={toggleOpen}
              handleSubtaskToggle={handleSubtaskToggle}
              updateTask={updateTask}
            />
            {subtask.subtasks && subtask.subtasks.length > 0 && openMap[subtask.id] ? (
              <Box key={`children-${subtask.id}`} sx={{ width: '100%' }}>
                <SubtaskList
                  subtasks={subtask.subtasks}
                  level={level + 1}
                  updateTask={updateTask}
                  openMap={openMap}
                  toggleOpen={toggleOpen}
                  handleSubtaskToggle={handleSubtaskToggle}
                />
              </Box>
            ) : null}
          </React.Fragment>
        ))}
      </Stack>
    );
  });

  if (!open || !localTask) return null;

  return (
    <Dialog open={open} onClose={onClose} fullScreen={window.innerWidth < 900} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 2 }} component="div">
        <span style={{ flex: 1 }}>Task Details</span>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ paddingTop: '10px' }}>
        <Stack spacing={2}>
          {localTask.picture && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img src={localTask.picture} alt="Task preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
            </Box>
          )}
          <TextField
            label="Title"
            value={localTask.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <FormControl fullWidth>
            <InputLabel id="task-type-label">Task Type</InputLabel>
            <Select
              labelId="task-type-label"
              value={localTask.task_type}
              label="Task Type"
              onChange={e => setLocalTask(prev => prev ? { ...prev, task_type: e.target.value as "basic" | "work-task" | "food" } : null)}
            >
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="work-task">Work</MenuItem>
              <MenuItem value="food">Food</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ background: '#f7f7f7', borderRadius: 1, p: 2, minHeight: 48 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>Description</Typography>
              {!editingMainDescription && (
                <IconButton size="small" onClick={() => setEditingMainDescription(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <TextField
              multiline
              rows={3}
              value={editingMainDescription ? mainDescriptionDraft : (localTask.description || '')}
              inputRef={mainDescriptionRef}
              onChange={e => editingMainDescription ? setMainDescriptionDraft(e.target.value) : undefined}
              fullWidth
              sx={{ mb: 1 }}
              InputProps={{
                readOnly: !editingMainDescription,
              }}
            />
            {editingMainDescription ? (
              <Stack direction="row" spacing={1}>
                <IconButton size="small" onClick={async () => {
                  await updateTask(localTask.id, { description: mainDescriptionDraft });
                  setEditingMainDescription(false);
                }} color="primary">
                  <CheckIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setEditingMainDescription(false)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : null}
          </Box>
          {localTask.task_type === 'work-task' && (
            <TextField
              label="Deadline"
              type="date"
              value={localTask.deadline || ''}
              onChange={e => setLocalTask(prev => prev ? { ...prev, deadline: e.target.value } : null)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          )}
          {localTask.task_type === 'food' && (
            <>
              <TextField
                label="Carbohydrate (g/100g)"
                type="number"
                value={localTask.carbohydrate?.toString() || ''}
                onChange={e => setLocalTask(prev => prev ? { ...prev, carbohydrate: parseFloat(e.target.value) || 0 } : null)}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Protein (g/100g)"
                type="number"
                value={localTask.protein?.toString() || ''}
                onChange={e => setLocalTask(prev => prev ? { ...prev, protein: parseFloat(e.target.value) || 0 } : null)}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Fat (g/100g)"
                type="number"
                value={localTask.fat?.toString() || ''}
                onChange={e => setLocalTask(prev => prev ? { ...prev, fat: parseFloat(e.target.value) || 0 } : null)}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Picture URL (optional)"
                value={localTask.picture || ''}
                onChange={e => setLocalTask(prev => prev ? { ...prev, picture: e.target.value } : null)}
                fullWidth
                variant="outlined"
              />
            </>
          )}
          {localTask.subtasks && localTask.subtasks.length > 0 && (
            <Box sx={{ mt: 2, background: '#fafbfc', borderRadius: 2, p: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Subtasks</Typography>
              <SubtaskList
                subtasks={localTask.subtasks}
                updateTask={updateTask}
                openMap={openMap}
                toggleOpen={toggleOpen}
                handleSubtaskToggle={handleSubtaskToggle}
              />
            </Box>
          )}
          {/* Always show Add Subtask at the root level */}
          <Box sx={{ mt: 2, background: '#fafbfc', borderRadius: 2, p: 2, textAlign: 'center' }}>
            {!isAddingRootSubtask ? (
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setIsAddingRootSubtask(true)}>
                Add Subtask
              </Button>
            ) : (
              <form onSubmit={handleRootSubtaskFormSubmit} style={{ width: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                  <TextField
                    size={window.innerWidth < 600 ? 'medium' : 'small'}
                    value={newRootSubtaskTitle}
                    onChange={e => setNewRootSubtaskTitle(e.target.value)}
                    placeholder="Enter subtask title"
                    fullWidth
                    disabled={isSubmittingRootSubtask}
                    autoFocus
                  />
                  <IconButton
                    onClick={handleAddRootSubtask}
                    color="primary"
                    disabled={isSubmittingRootSubtask || !newRootSubtaskTitle.trim()}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setIsAddingRootSubtask(false)}
                    disabled={isSubmittingRootSubtask}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </form>
            )}
          </Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Checkbox checked={localTask.is_completed} onChange={() => handleSubtaskToggle(localTask.id, !localTask.is_completed)} />
            <Typography>Completed</Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        {!Object.values(editingDescriptions).some(isEditing => isEditing) && (
          <>
            <IconButton color="error"><DeleteIcon /></IconButton>
            <Button onClick={onClose} color="primary">Close</Button>
            <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal; 