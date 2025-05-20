export interface TaskUpdateDTO {
  title?: string;
  is_completed?: boolean;
  parent_id?: number | null;
  description?: string;
  task_type?: string;
} 