const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Path to the tasks file
const tasksFilePath = path.join(__dirname, 'tasks.json');

// Middleware to validate task input
function validateTaskInput(req, res, next) {
  const { title, status } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and should be a non-empty string.' });
  }

  if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Status should be one of "pending", "in-progress", or "completed".' });
  }

  next();
}

// Helper function to read tasks from the file
function readTasks() {
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper function to write tasks to the file
function writeTasks(tasks) {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), 'utf-8');
}

// Create a new task (POST)
app.post('/tasks', validateTaskInput, (req, res) => {
  const { title, status = 'pending' } = req.body;
  const tasks = readTasks();

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    status
  };

  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json(newTask);
});

// Get all tasks (GET)
app.get('/tasks', (req, res) => {
  const tasks = readTasks();
  res.status(200).json(tasks);
});

// Get a task by ID (GET)
app.get('/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === parseInt(req.params.id));

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json(task);
});

// Update a task (PUT)
app.put('/tasks/:id', validateTaskInput, (req, res) => {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, status } = req.body;
  tasks[taskIndex] = { ...tasks[taskIndex], title, status };

  writeTasks(tasks);

  res.status(200).json(tasks[taskIndex]);
});

// Delete a task (DELETE)
app.delete('/tasks/:id', (req, res) => {
  let tasks = readTasks();
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));

  writeTasks(tasks);

  res.status(204).send();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Task Manager API running on http://localhost:${PORT}`);
});
