const express = require('express');
const { isAuthenticated } = require('./auth');
const { createTodo, getTodos, updateTodo, deleteTodo } = require('../database');
const router = express.Router();

// Apply authentication middleware to all todo routes
router.use(isAuthenticated);

// Get all todos
router.get('/', async (req, res) => {
    try {
        const todos = await getTodos(req.session.userId);
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new todo
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const todoId = await createTodo(req.session.userId, title);
        res.status(201).json({ id: todoId, message: 'Todo created successfully' });
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update todo status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;
        
        if (completed === undefined) {
            return res.status(400).json({ error: 'Completed status is required' });
        }

        const changes = await updateTodo(id, req.session.userId, completed);
        if (changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json({ message: 'Todo updated successfully' });
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete todo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const changes = await deleteTodo(id, req.session.userId);
        
        if (changes === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;