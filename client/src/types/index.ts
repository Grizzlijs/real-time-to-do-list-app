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
  subtasks?: Task[];
}

export interface TaskCreateDTO {
  title: string;
  description?: string;
  list_id: number;
  task_order?: number;
  parent_id?: number | null;

  task_type?: string;
}

export interface TaskUpdateDTO {
  id: number;
  title?: string;
  description?: string | null;
  is_completed?: boolean;
  task_order?: number;
  parent_id?: number | null;
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
