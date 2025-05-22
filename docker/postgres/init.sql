-- Create tables for the to-do list application
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  task_order INTEGER NOT NULL,
  parent_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  task_type VARCHAR(50) DEFAULT 'basic',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Special fields for work-task type
  deadline DATE,
  
  -- Special fields for food-task type
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  image_url TEXT
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_color VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performant queries
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_chat_messages_list_id ON chat_messages(list_id);

-- Create a default list to start with
INSERT INTO lists (title, slug) VALUES 
('Getting Started', 'getting-started');

-- Add some initial tasks to the default list
INSERT INTO tasks (title, description, list_id, task_order, task_type) VALUES 
('Welcome to your collaborative to-do list!', 'This is a **real-time collaborative** to-do list application. Try adding, editing, and completing tasks!', 1, 0, 'basic'),
('Create a new task', 'Click the "Add Task" button to create a new task.', 1, 1, 'basic'),
('Share this list with others', 'Share the URL of this page to collaborate in real-time with others.', 1, 2, 'basic'),
('Try different task types', 'You can create different types of tasks: Basic, Work (with deadlines), and Food (with nutritional info).', 1, 3, 'basic');
