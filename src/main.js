import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="todo-app">
    <div class="top-bar">
      <h1>My Daily To-Do List</h1>
      <button type="button" id="theme-toggle" class="theme-toggle">Dark Mode</button>
    </div>

    <form id="task-form" class="task-form">
      <input
        id="task-input"
        type="text"
        placeholder="Add a new task..."
        autocomplete="off"
      />
      <button type="submit">Add</button>
    </form>

    <div class="filters">
      <button type="button" class="filter-btn active" data-filter="all">All</button>
      <button type="button" class="filter-btn" data-filter="active">Active</button>
      <button type="button" class="filter-btn" data-filter="completed">Completed</button>
    </div>

    <ul id="task-list" class="task-list"></ul>
  </main>
`

const taskForm = document.querySelector('#task-form')
const taskInput = document.querySelector('#task-input')
const taskList = document.querySelector('#task-list')
const filterButtons = document.querySelectorAll('.filter-btn')
const themeToggle = document.querySelector('#theme-toggle')

const STORAGE_KEY = 'todo-tasks'
const THEME_KEY = 'todo-theme'

let tasks = loadTasks()
let currentFilter = 'all'
let theme = loadTheme()

applyTheme()
updateThemeButton()

renderTasks()

taskForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const text = taskInput.value.trim()
  if (!text) return

  const newTask = {
    id: Date.now(),
    text,
    completed: false,
  }

  tasks.push(newTask)
  saveTasks()
  renderTasks()
  taskInput.value = ''
  taskInput.focus()
})

taskList.addEventListener('click', (event) => {
  const target = event.target

  if (target.classList.contains('toggle-btn')) {
    const id = Number(target.dataset.id)
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
    saveTasks()
    renderTasks()
    return
  }

  if (target.classList.contains('delete-btn')) {
    const id = Number(target.dataset.id)
    tasks = tasks.filter((task) => task.id !== id)
    saveTasks()
    renderTasks()
  }
})

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter

    filterButtons.forEach((btn) => btn.classList.remove('active'))
    button.classList.add('active')

    renderTasks()
  })
})

themeToggle.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark'
  saveTheme()
  applyTheme()
  updateThemeButton()
})

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed)
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed)
  }

  return tasks
}

function renderTasks() {
  const filteredTasks = getFilteredTasks()

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<li class="empty-message">No tasks to show.</li>`
    return
  }

  taskList.innerHTML = filteredTasks
    .map(
      (task) => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
          <span>${escapeHtml(task.text)}</span>
          <div class="task-actions">
            <button type="button" class="toggle-btn" data-id="${task.id}">
              ${task.completed ? 'Undo' : 'Complete'}
            </button>
            <button type="button" class="delete-btn" data-id="${task.id}">
              Delete
            </button>
          </div>
        </li>
      `
    )
    .join('')
}

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return []

  try {
    const parsedTasks = JSON.parse(saved)
    return Array.isArray(parsedTasks) ? parsedTasks : []
  } catch {
    return []
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY)
  return savedTheme === 'dark' ? 'dark' : 'light'
}

function saveTheme() {
  localStorage.setItem(THEME_KEY, theme)
}

function applyTheme() {
  document.body.classList.toggle('dark-mode', theme === 'dark')
}

function updateThemeButton() {
  themeToggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode'
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
