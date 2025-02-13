document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');

    loadTasks();

    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const task = taskInput.value.trim();
        const priority = prioritySelect.value;
        const dueDate = dueDateInput.value;

        if (task && dueDate) {
            const listItem = createTaskElement(task, priority, dueDate);
            insertTaskInOrder(listItem, priority);
            saveTasks();
            taskInput.value = '';
            dueDateInput.value = '';
        } else {
            alert('Task and due date cannot be empty!');
        }
    }

    function createTaskElement(task, priority, dueDate) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.dataset.priority = priority;
        listItem.dataset.dueDate = dueDate;

        switch (priority) {
            case 'high':
                listItem.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                break;
            case 'medium':
                listItem.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                break;
            case 'low':
                listItem.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
                break;
        }

        const isOverdue = new Date(dueDate) < new Date();
        if (isOverdue) {
            listItem.classList.add('list-group-item-danger');
        }

        listItem.innerHTML = `
            <span>${task} (Due: ${new Date(dueDate).toLocaleDateString()})</span>
            <div>
                <button class="btn btn-sm btn-success done-button">Done</button>
                <button class="btn btn-sm btn-warning edit-button">Edit</button>
                <button class="btn btn-sm btn-danger delete-button">Delete</button>
            </div>
        `;
        return listItem;
    }

    function insertTaskInOrder(listItem, priority) {
        const tasks = Array.from(taskList.children);
        let inserted = false;

        for (let i = 0; i < tasks.length; i++) {
            const currentPriority = tasks[i].dataset.priority;
            if (shouldInsertBefore(priority, currentPriority)) {
                taskList.insertBefore(listItem, tasks[i]);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            taskList.appendChild(listItem);
        }
    }

    function shouldInsertBefore(newPriority, currentPriority) {
        const priorities = { high: 1, medium: 2, low: 3 };
        return priorities[newPriority] < priorities[currentPriority];
    }

    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            const listItem = e.target.closest('li');
            taskList.removeChild(listItem);
            saveTasks();
        }
        if (e.target.classList.contains('done-button')) {
            const listItem = e.target.closest('li');
            const taskText = listItem.querySelector('span');
            taskText.classList.toggle('text-decoration-line-through');
            saveTasks();
        }
        if (e.target.classList.contains('edit-button')) {
            const listItem = e.target.closest('li');
            const taskText = listItem.querySelector('span');
            const currentTask = taskText.textContent.split(' (Due:')[0];
            const currentDueDate = listItem.dataset.dueDate;
            const currentPriority = listItem.dataset.priority;

            const newTask = prompt('Edit your task:', currentTask);
            const newDueDate = prompt ('Edit due date (YYYY-MM-DD):', currentDueDate);
            const newPriority = prompt('Edit priority (high, medium, low):', currentPriority);

            if (newTask && newDueDate && newPriority) {
                taskText.textContent = `${newTask.trim()} (Due: ${new Date(newDueDate).toLocaleDateString()})`;
                listItem.dataset.dueDate = newDueDate;
                listItem.dataset.priority = newPriority;

                switch (newPriority) {
                    case 'high':
                        listItem.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                        break;
                    case 'medium':
                        listItem.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                        break;
                    case 'low':
                        listItem.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
                        break;
                }
                taskList.removeChild(listItem);
                insertTaskInOrder(listItem, newPriority);
                saveTasks();
            } else {
                alert('Task, due date, and priority cannot be empty!');
            }
        }
    });

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach((listItem) => {
            const taskText = listItem.querySelector('span').textContent.split(' (Due:')[0];
            const dueDate = listItem.dataset.dueDate;
            const priority = listItem.dataset.priority;
            const isDone = listItem.querySelector('span').classList.contains('text-decoration-line-through');
            tasks.push({ text: taskText, dueDate, priority, done: isDone });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const listItem = createTaskElement(task.text, task.priority, task.dueDate);
            if (task.done) {
                listItem.querySelector('span').classList.add('text-decoration-line-through');
            }
            insertTaskInOrder(listItem, task.priority);
        });
    }
});