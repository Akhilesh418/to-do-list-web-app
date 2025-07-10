$(document).ready(function () {
  let tasks = [];

  function renderTasks(filter = 'all') {
    const taskList = $('#taskList');
    taskList.empty();
    let filteredTasks = tasks;

    if (filter === 'active') {
      filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
      filteredTasks = tasks.filter(task => task.completed);
    }

    $('#taskCount').text(filteredTasks.length);

    if (filteredTasks.length === 0) {
      taskList.append('<li class="text-muted text-center py-2">No tasks available</li>');
      return;
    }

    filteredTasks.forEach((task, index) => {
      const taskClass = task.completed ? 'task-complete' : '';
      const listItem = `
        <li class="task-item ${taskClass}">
          <span class="task-text" style="cursor:pointer" data-index="${index}">${task.text}</span>
          <button class="btn btn-sm btn-danger delete-task" data-index="${index}"><i class="fas fa-trash"></i></button>
        </li>
      `;
      taskList.append(listItem);
    });
  }

  $('#taskForm').on('submit', function (e) {
    e.preventDefault();
    const taskText = $('#taskInput').val().trim();
    if (!taskText) {
      $('#taskError').text('Task cannot be empty.').removeClass('d-none');
      return;
    }
    $('#taskError').addClass('d-none');
    tasks.push({ text: taskText, completed: false });
    $('#taskInput').val('');
    renderTasks();
  });

  $('#taskList').on('click', '.task-text', function () {
    const index = $(this).data('index');
    tasks[index].completed = !tasks[index].completed;
    renderTasks($('[data-filter].active').data('filter'));
  });

  $('#taskList').on('click', '.delete-task', function () {
    const index = $(this).data('index');
    tasks.splice(index, 1);
    renderTasks($('[data-filter].active').data('filter'));
  });

  $('[data-filter]').on('click', function () {
    $('[data-filter]').removeClass('active');
    $(this).addClass('active');
    const filter = $(this).data('filter');
    renderTasks(filter);
  });

  $('#clearCompletedBtn').on('click', function () {
    tasks = tasks.filter(task => !task.completed);
    renderTasks($('[data-filter].active').data('filter'));
  });

  $('#toggleDarkMode').on('click', function () {
    $('body').toggleClass('dark-mode');
    const icon = $(this).find('i');
    icon.toggleClass('fa-moon fa-sun');
    $(this).toggleClass('btn-outline-dark btn-outline-light');
  });

  renderTasks();
});
