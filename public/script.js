const taskList = document.querySelector('.task-list');
let editTaskId = null;

// Function to display toast notifications
function showToast(message, type = "success") {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "center",
    backgroundColor: type === "success" ? "#28a745" : "#dc3545",
  }).showToast();
}

// Open task modal for adding/editing a task
document.querySelector('.add-task-btn').addEventListener('click', () => {
  resetModal();
  document.querySelector('.task-modal').classList.remove('hidden');
});

// Close task modal without saving
document.getElementById('cancel-task').addEventListener('click', () => {
  document.querySelector('.task-modal').classList.add('hidden');
});

// Save task (either new or edited)
document.getElementById('save-task').addEventListener('click', () => {
  const taskName = document.getElementById('task-name').value;
  const taskDate = document.getElementById('task-date').value;
  const taskPriority = document.getElementById('task-priority').value;

  if (!taskName || !taskDate) {
    showToast("Please fill in all fields.", "error");
    return;
  }

  const taskData = { name: taskName, due_date: taskDate, priority: taskPriority };

  if (editTaskId) {
    // Edit existing task
    fetch(`http://localhost:3000/tasks/${editTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    })
      .then(response => response.json())
      .then(() => {
        showToast("Task updated successfully!");
        document.querySelector('.task-modal').classList.add('hidden');
        resetModal();
        fetchTasks(); // Refresh task list
      })
      .catch(error => {
        console.error('Error updating task:', error);
        showToast("Failed to update task.", "error");
      });
  } else {
    // Add new task
    fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    })
      .then(response => response.json())
      .then(() => {
        showToast("Task saved successfully!");
        document.querySelector('.task-modal').classList.add('hidden');
        resetModal();
        fetchTasks(); // Refresh task list
      })
      .catch(error => {
        console.error('Error adding task:', error);
        showToast("Failed to save task.", "error");
      });
  }
});

// Reset modal inputs
function resetModal() {
  document.getElementById('task-name').value = '';
  document.getElementById('task-date').value = '';
  document.getElementById('task-priority').value = 'low';
  editTaskId = null;
}

// Fetch and display all tasks from the server
function fetchTasks() {
  fetch('http://localhost:3000/tasks')
    .then(response => response.json())
    .then(tasks => {
      taskList.innerHTML = ''; // Clear the current list
      tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card', task.priority);
        taskCard.dataset.id = task.id; // Store task ID in dataset
        taskCard.innerHTML = `
          <p class="task-title">${task.name} - ${task.due_date}</p>
          <div class="task-actions">
            <button class="edit-btn">✎ Edit</button>
            <button class="delete-btn">🗑 Delete</button>
          </div>
        `;
        taskList.appendChild(taskCard);
      });
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
      showToast("Failed to fetch tasks.", "error");
    });
}

// Handle edit and delete task actions
taskList.addEventListener('click', (e) => {
  const taskCard = e.target.closest('.task-card');
  if (taskCard) {
    const taskId = taskCard.dataset.id;

    if (e.target.classList.contains('edit-btn')) {
      // Edit task
      const taskTitle = taskCard.querySelector('.task-title').textContent.split(' - ');
      document.getElementById('task-name').value = taskTitle[0];
      document.getElementById('task-date').value = taskTitle[1];
      document.getElementById('task-priority').value = taskCard.classList[1];

      editTaskId = taskId;
      document.querySelector('.task-modal').classList.remove('hidden');
    } else if (e.target.classList.contains('delete-btn')) {
      // Delete task
      fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'DELETE',
      })
        .then(() => {
          showToast("Task deleted successfully!");
          fetchTasks(); // Refresh task list
        })
        .catch(error => {
          console.error('Error deleting task:', error);
          showToast("Failed to delete task.", "error");
        });
    }
  }
});

// Load tasks when the page is loaded
window.addEventListener('load', fetchTasks);
