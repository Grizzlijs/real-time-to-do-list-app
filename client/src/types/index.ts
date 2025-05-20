export interface TodoList {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  tasks: Task[];
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  list_id: number;
  task_order: number;
  parent_id?: number | null;
  subtasks?: Task[];
  task_type: 'basic' | 'work-task' | 'food' | string;
  created_at?: string;
  updated_at?: string;
  
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
  id: number;
  title?: string;
  description?: string | null;
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

export interface ChatMessage {
  id: number;
  content: string;
  user_id: string;
  list_id: number;
  created_at: string;
}
