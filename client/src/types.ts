export interface ChatMessage {
  id: string;
  text: string;
  sender: {
    name: string;
    color: string;
  };
  timestamp: number;
}

export interface TodoList {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  task_order: number;
  parent_id: number | null;
  list_id: number;
  task_type: 'basic' | 'work-task' | 'food';
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
  
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
  list_id: number;
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
  cost?: number | null;
  
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