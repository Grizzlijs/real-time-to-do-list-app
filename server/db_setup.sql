-- Create database
CREATE DATABASE todo_app;

-- Connect to the database
\c todo_app;

-- Create lists table
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
  
  -- Special fields for food type
  carbohydrate DECIMAL,
  protein DECIMAL,
  fat DECIMAL,
  picture VARCHAR(255)
);

-- Create indexes
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_lists_slug ON lists(slug);

-- Insert sample data
INSERT INTO lists (title, slug) VALUES 
  ('Work Tasks', 'work-tasks'),
  ('Personal Tasks', 'personal-tasks'),
  ('Food Diary', 'food-diary');

-- Regular tasks
INSERT INTO tasks (title, description, list_id, task_order) VALUES
  ('Complete project proposal', 'Draft the initial proposal for client review', 1, 1),
  ('Schedule team meeting', 'Send out calendar invites for weekly sync', 1, 2),
  ('Grocery shopping', 'Buy fruits, vegetables, and snacks', 2, 1),
  ('Pay bills', 'Electricity and internet due this week', 2, 2);

-- Work tasks with deadline
INSERT INTO tasks (title, description, list_id, task_order, task_type, deadline) VALUES
  ('Submit quarterly report', 'Prepare and submit the Q2 financial report', 1, 3, 'work-task', '2025-06-30'),
  ('Client presentation', 'Present new feature proposals to the client', 1, 4, 'work-task', '2025-05-25');

-- Food tasks with nutritional information
INSERT INTO tasks (title, list_id, task_order, task_type, carbohydrate, protein, fat, picture) VALUES
  ('Grilled Chicken Salad', 3, 1, 'food', 12.5, 25.3, 8.1, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
  ('Avocado Toast', 3, 2, 'food', 35.2, 8.5, 15.7, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd');