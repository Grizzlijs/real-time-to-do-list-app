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
  task_type: 'basic' | 'work-task' | 'food' | string;
  created_at: string;
  updated_at: string;

  // Special fields for work-task type
  deadline?: string;

  // Special fields for food type
  carbohydrate?: number;
  protein?: number;
  fat?: number;
  picture?: string;
}

export interface TaskCreateDTO {
  title: string;
  description?: string;
  list_id: number;
  task_order?: number;
  parent_id?: number | null;
  task_type?: string;

  // Special fields for work-task type
  deadline?: string;

  // Special fields for food type
  carbohydrate?: number;
  protein?: number;
  fat?: number;
  picture?: string;
}

export interface TaskUpdateDTO {
  title?: string;
  description?: string;
  is_completed?: boolean;
  task_order?: number;
  parent_id?: number | null;
  task_type?: string;

  // Special fields for work-task type
  deadline?: string;

  // Special fields for food type
  carbohydrate?: number;
  protein?: number;
  fat?: number;
  picture?: string;
}

export interface ListCreateDTO {
  title: string;
}
