// DOM Elements
const authForms = document.getElementById('auth-forms');
const todoApp = document.getElementById('todo-app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const logoutBtn = document.getElementById('logout-btn');

// Check authentication status on page load
checkAuth();

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
todoForm.addEventListener('submit', handleAddTodo);
logoutBtn.addEventListener('click', handleLogout);

// Auth Functions
async function checkAuth() {
    try {
        const response = await fetch('/auth/status');
        if (response.ok) {
            showTodoApp();
            loadTodos();
        } else {
            showAuthForms();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showAuthForms();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            showToast('Logged in successfully', 'success');
            showTodoApp();
            loadTodos();
            loginForm.reset();
        } else {
            const data = await response.json();
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Login failed:', error);
        showToast('Login failed', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            showToast('Registered successfully', 'success');
            showTodoApp();
            loadTodos();
            registerForm.reset();
        } else {
            const data = await response.json();
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Registration failed:', error);
        showToast('Registration failed', 'error');
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/auth/logout', { method: 'POST' });
        if (response.ok) {
            showToast('Logged out successfully', 'success');
            showAuthForms();
        }
    } catch (error) {
        console.error('Logout failed:', error);
        showToast('Logout failed', 'error');
    }
}

// Todo Functions
async function loadTodos() {
    try {
        const response = await fetch('/api/todos');
        if (response.ok) {
            const todos = await response.json();
            renderTodos(todos);
        }
    } catch (error) {
        console.error('Failed to load todos:', error);
        showToast('Failed to load todos', 'error');
    }
}

async function handleAddTodo(e) {
    e.preventDefault();
    const title = todoInput.value.trim();

    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            showToast('Todo added successfully', 'success');
            todoForm.reset();
            loadTodos();
        } else {
            const data = await response.json();
            showToast(data.error, 'error');
        }
    } catch (error) {
        console.error('Failed to add todo:', error);
        showToast('Failed to add todo', 'error');
    }
}

async function handleToggleTodo(id, completed) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !completed })
        });

        if (response.ok) {
            loadTodos();
        } else {
            showToast('Failed to update todo', 'error');
        }
    } catch (error) {
        console.error('Failed to toggle todo:', error);
        showToast('Failed to update todo', 'error');
    }
}

async function handleDeleteTodo(id) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Todo deleted successfully', 'success');
            loadTodos();
        } else {
            showToast('Failed to delete todo', 'error');
        }
    } catch (error) {
        console.error('Failed to delete todo:', error);
        showToast('Failed to delete todo', 'error');
    }
}

// UI Functions
function showAuthForms() {
    authForms.classList.remove('d-none');
    todoApp.classList.add('d-none');
}

function showTodoApp() {
    authForms.classList.add('d-none');
    todoApp.classList.remove('d-none');
}

function renderTodos(todos) {
    todoList.innerHTML = todos.map(todo => `
        <li class="list-group-item">
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" class="form-check-input" 
                    ${todo.completed ? 'checked' : ''}
                    onclick="handleToggleTodo(${todo.id}, ${todo.completed})">
                <span class="todo-text">${escapeHtml(todo.title)}</span>
                <button class="btn btn-danger btn-sm" 
                    onclick="handleDeleteTodo(${todo.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `
        <div class="toast-body">
            ${message}
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}