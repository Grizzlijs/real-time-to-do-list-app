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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_lists_slug ON lists(slug);

-- Insert sample data
INSERT INTO lists (title, slug) VALUES 
  ('Work Tasks', 'work-tasks'),
  ('Personal Tasks', 'personal-tasks');

INSERT INTO tasks (title, description, list_id, task_order) VALUES
  ('Complete project proposal', 'Draft the initial proposal for client review', 1, 1),
  ('Schedule team meeting', 'Send out calendar invites for weekly sync', 1, 2),
  ('Grocery shopping', 'Buy fruits, vegetables, and snacks', 2, 1),
  ('Pay bills', 'Electricity and internet due this week', 2, 2); 