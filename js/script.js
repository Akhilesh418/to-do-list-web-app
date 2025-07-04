$(document).ready(function() {
    const taskInput = $('#taskInput');
    const taskList = $('#taskList');
    const taskError = $('#taskError');
    const clearCompletedBtn = $('#clearCompletedBtn');
    const filterButtons = $('.btn-group button');

    // State variable for current filter (all, active, completed)
    let currentFilter = 'all';

    // Load tasks from Local Storage
    // Each task is an object: { id: uniqueId, text: "Task Description", completed: false }
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- Helper Functions ---

    // Generates a simple unique ID for tasks
    function generateUniqueId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Saves the current tasks array to Local Storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Renders tasks to the DOM based on the current filter
    function renderTasks() {
        taskList.empty(); // Clear current list using jQuery's .empty()

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') {
                return !task.completed;
            } else if (currentFilter === 'completed') {
                return task.completed;
            }
            return true; // 'all' filter, show all tasks
        });

        if (filteredTasks.length === 0) {
            // Display a message if no tasks match the current filter
            taskList.append(`<li class="list-group-item empty-list-message">No ${currentFilter} tasks to display.</li>`);
        } else {
            // Append each filtered task to the list
            filteredTasks.forEach(task => {
                const listItem = $(`
                    <li class="list-group-item" data-id="${task.id}">
                        <div class="form-check">
                            <input class="form-check-input toggle-complete-checkbox" type="checkbox" ${task.completed ? 'checked' : ''} id="task-${task.id}">
                            <label class="form-check-label task-text ${task.completed ? 'completed' : ''}" for="task-${task.id}">
                                ${task.text}
                            </label>
                        </div>
                        <div class="task-actions">
                            <button class="btn btn-info btn-sm edit-btn" title="Edit Task">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-btn" title="Delete Task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </li>
                `);
                taskList.append(listItem);
            });
        }
        // Show/hide the 'Clear Completed' button based on if any tasks are completed
        clearCompletedBtn.toggle(tasks.some(task => task.completed));
    }

    // --- Task Actions ---

    // Adds a new task to the array and re-renders
    function addTask(text) {
        if (text.trim() === '') {
            showError('Please enter a task!');
            return;
        }
        tasks.push({ id: generateUniqueId(), text: text.trim(), completed: false });
        saveTasks();
        renderTasks();
        taskInput.val(''); // Clear input field using jQuery's .val()
        hideError(); // Hide error if successful
    }

    // Toggles the 'completed' status of a task by its ID
    function toggleComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    // Deletes a task by its ID
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    // Edits the text of a task by its ID
    function editTask(id, newText) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }

    // Clears all tasks that are marked as completed
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    // --- UI Feedback Functions ---

    // Displays an error message
    function showError(message) {
        taskError.text(message).removeClass('d-none'); // Set text and show
    }

    // Hides the error message
    function hideError() {
        taskError.addClass('d-none'); // Hide
    }

    // --- Event Listeners ---

    // Handle form submission to add a new task
    $('#taskForm').on('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        addTask(taskInput.val()); // Get input value using jQuery's .val()
    });

    // Event delegation for dynamically created task items
    // Handles toggling complete status, deleting tasks, and initiating edit
    taskList.on('click', '.toggle-complete-checkbox', function() {
        const taskId = $(this).closest('.list-group-item').data('id');
        toggleComplete(taskId);
    });

    taskList.on('click', '.delete-btn', function() {
        const taskId = $(this).closest('.list-group-item').data('id');
        deleteTask(taskId);
    });

    taskList.on('click', '.edit-btn', function() {
        const listItem = $(this).closest('.list-group-item');
        const taskId = listItem.data('id');
        const taskTextElement = listItem.find('.task-text');
        const currentText = taskTextElement.text().trim();

        // Replace label with input field for editing
        const editInput = $('<input type="text" class="form-control edit-input">').val(currentText);
        taskTextElement.replaceWith(editInput);
        editInput.focus(); // Focus on the new input field

        // Change edit button to save button
        const editButton = $(this);
        editButton.html('<i class="fas fa-save"></i>').removeClass('btn-info').addClass('btn-success save-edit-btn');
    });

    // Event listener for saving edited task (delegated)
    taskList.on('click', '.save-edit-btn', function() {
        const listItem = $(this).closest('.list-group-item');
        const taskId = listItem.data('id');
        const editInput = listItem.find('.edit-input');
        const newText = editInput.val();

        if (newText.trim() === '') {
            showError('Task description cannot be empty!');
            editInput.addClass('is-invalid'); // Add Bootstrap validation style
            return;
        }

        editTask(taskId, newText);
        hideError();
        // renderTasks() will rebuild the list, so no need to revert buttons here
    });

    // Event listener for Enter key on edit input
    taskList.on('keypress', '.edit-input', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent new line in input
            const listItem = $(this).closest('.list-group-item');
            const taskId = listItem.data('id');
            const newText = $(this).val();

            if (newText.trim() === '') {
                showError('Task description cannot be empty!');
                $(this).addClass('is-invalid');
                return;
            }

            editTask(taskId, newText);
            hideError();
        }
    });

    // Handle 'Clear Completed' button click
    clearCompletedBtn.on('click', clearCompletedTasks);

    // Handle filter button clicks
    filterButtons.on('click', function() {
        filterButtons.removeClass('active'); // Remove active class from all filters
        $(this).addClass('active'); // Add active class to the clicked filter
        currentFilter = $(this).data('filter'); // Get the filter type from data-filter attribute
        renderTasks(); // Re-render tasks with the new filter
    });

    // Initial render when the page loads
    renderTasks();
});