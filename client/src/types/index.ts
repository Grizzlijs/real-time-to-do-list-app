export interface TodoList {
  id: number;
  title: string;
  slug: string;
  created_at: string;
}

export interface Task {
  id: number;
  list_id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  task_order: number;
  parent_id?: number | null;
  cost?: number | null;
  task_type: 'basic' | 'work-task' | 'food' | string;
  created_at: string;
  updated_at: string;
  subtasks?: Task[]; // Used for frontend rendering
  totalCost?: number; // Used for frontend calculation
}

export interface TaskCreateDTO {
  title: string;
  description?: string;
  list_id: number;
  task_order?: number;
  parent_id?: number | null;
  cost?: number | null;
  task_type?: string;
}

export interface TaskUpdateDTO {
  title?: string;
  description?: string;
  is_completed?: boolean;
  task_order?: number;
  cost?: number | null;
  task_type?: string;
}

export interface ListCreateDTO {
  title: string;
}
