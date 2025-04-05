const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const validateTask = require('../middleware/validateTask');

const tasksFilePath = path.join(__dirname, '../tasks.json');

const getTasks = () => {
  const tasksData = fs.readFileSync(tasksFilePath);
  return JSON.parse(tasksData);
};

// 1. Create a new task (POST)
router.post('/', validateTask, (req, res) => {
  const tasks = getTasks();
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    status: req.body.status,
  };

  tasks.push(newTask);
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));

  res.status(201).json({ message: 'Task created successfully', task: newTask });
});

// 2. Get all tasks (GET)
router.get('/', (req, res) => {
  const tasks = getTasks();
  res.status(200).json(tasks);
});

// 3. Update a task (PUT)
router.put('/:id', validateTask, (req, res) => {
  const tasks = getTasks();
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));

  res.status(200).json({ message: 'Task updated successfully', task: tasks[taskIndex] });
});

// 4. Delete a task (DELETE)
router.delete('/:id', (req, res) => {
  const tasks = getTasks();
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));

  res.status(200).json({ message: 'Task deleted successfully' });
});

module.exports = router;
