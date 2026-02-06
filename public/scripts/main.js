import { store, user } from './api.js';

if (!user.getUser().email) window.location.assign('/EventHub/auth/login.html');

function handleChangeVision(param) {
  if (param == 'list') {
    document.getElementById('events-list').classList.remove('hide');
    document.getElementById('events-table').classList.add('hide');
  } else {
    document.getElementById('events-list').classList.add('hide');
    document.getElementById('events-table').classList.remove('hide');
  }
  if (store.getEvents().length == 0) {
    document.getElementById('events-list').classList.add('hide');
    document.getElementById('events-table').classList.add('hide');
    document.getElementById('events__empty').classList.remove('hide');
  }
}

document
  .getElementById('by-list')
  .addEventListener('click', () => handleChangeVision('list'));
document
  .getElementById('by-table')
  .addEventListener('click', () => handleChangeVision('table'));

function handleRemoveEvent(e, id) {
  e.preventDefault();
  store.deleteEvents(id);
  loadEvents();
}

function loadEvents(search) {
  let events = store.getEvents();

  if (search) {
    events = events.filter((event) => event.title.includes(search));
  }

  const list = document.getElementById('events-list');
  const tableBody = document.getElementById('events-table-body');
  const table = document.getElementById('events-table');
  list.innerHTML = '';
  tableBody.innerHTML = '';

  if (events.length != 0) {
    document.getElementById('events__empty').classList.add('hide');
    list.classList.remove('hide');
    const eventTemplate = document.getElementById(
      'event-card-template',
    ).content;
    const eventRowTemplate = document.getElementById(
      'event-table-row-template',
    ).content;

    events.forEach((event) => {
      // добавляем списко карточек
      const eventCard = eventTemplate.cloneNode(true);
      eventCard.querySelector('.card-media').style.background =
        `url(${event.image || './images/theatre.jpg'})`;
      eventCard.querySelector('.card-header').textContent = event.title;
      eventCard.querySelector('.event-author').textContent = event.author;
      eventCard.querySelector('.event-description').textContent = event.desc;
      eventCard.querySelector('.event-date').textContent = event.date;
      eventCard.querySelector('.event-place').textContent = event.place;
      const link = eventCard.querySelector('.event-button');
      link.setAttribute('href', `./event.html?id=${event.id}`);
      eventCard
        .querySelector('.remove-button')
        .addEventListener('click', (e) => handleRemoveEvent(e, event.id));
      eventCard
        .querySelector('.edit-event-button')
        .addEventListener('click', (e) => handleOpenEditModal(e, event.id));
      list.appendChild(eventCard);

      // добавляем таблицу событий
      const eventRow = eventRowTemplate.cloneNode(true);
      eventRow.querySelector('.cell-id').textContent = event.id;
      eventRow.querySelector('.cell-title').textContent = event.title;
      eventRow.querySelector('.cell-desc').textContent = event.desc;
      eventRow.querySelector('.cell-author').textContent = event.author;
      eventRow.querySelector('.cell-date').textContent = event.date;
      eventRow.querySelector('.cell-place').textContent = event.place;
      tableBody.appendChild(eventRow);
    });
  } else {
    list.classList.add('hide');
    table.classList.add('hide');
    document.getElementById('events__empty').classList.remove('hide');
  }
}

loadEvents();

// Поиск событий

function handleSearch(e) {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  loadEvents(formData.search);
}

document.getElementById('search-form').addEventListener('submit', handleSearch);

// открытие и закрытие формы создания события

function handleOpenCreatorModal(e) {
  e.preventDefault();
  document.getElementById('create-event-modal').classList.add('active');
}

function handleCloseCreatorModal(e) {
  e.preventDefault();
  document.getElementById('create-event-modal').classList.remove('active');
}

document
  .getElementById('close-cretor-modal')
  .addEventListener('click', handleCloseCreatorModal);
document
  .querySelector('.create-event')
  .addEventListener('click', handleOpenCreatorModal);

// открытие и закрытие формы генерации события

function handleOpenGeneratorModal(e) {
  e.preventDefault();
  document.getElementById('generate-event-modal').classList.add('active');
}

function handleCloseGeneratorModal(e) {
  e.preventDefault();
  document.getElementById('generate-event-modal').classList.remove('active');
}

document
  .getElementById('close-generator-modal')
  .addEventListener('click', handleCloseGeneratorModal);
document
  .querySelector('.gen-event')
  .addEventListener('click', handleOpenGeneratorModal);

// открытие и закрытие формы редактирования события

function handleOpenEditModal(e, id) {
  e.preventDefault();
  const form = document.getElementById('edit-event-form');
  const event = store.getEventById(id);
  form.dataset.id = id;
  console.log(e.target);
  form.querySelector('#edit-title').value = event.title;
  form.querySelector('#edit-desc').value = event.desc;
  form.querySelector('#edit-date').value = event.date;
  form.querySelector('#edit-place').value = event.place;
  document.getElementById('edit-event-modal').classList.add('active');
}

function handleCloseEditModal(e) {
  e.preventDefault();
  document.getElementById('edit-event-modal').classList.remove('active');
}

document
  .getElementById('close-edit-modal')
  .addEventListener('click', handleCloseEditModal);

// обработка формы создания события

let users = [];

function setError(field) {
  document.getElementById(field + '-error').classList.add('active');
}

function clearErrors(keys) {
  keys.forEach((key) => {
    document.getElementById(key + '-error').classList.remove('active');
  });
}

function validateFormCreate(event) {
  const keys = Object.keys(event).filter((key) => key != 'users');
  let errors = [];
  keys.forEach((key) => {
    if (event[key] == '') {
      setError(key);
      errors.push(key);
    }
  });
  clearErrors(keys.filter((key) => !errors.includes(key)));
  if (errors.length == 0) return true;
  else return false;
}

function handleCreateEvent(e) {
  e.preventDefault();
  const event = Object.fromEntries(new FormData(e.target));
  if (validateFormCreate(event)) {
    event.users = users;
    store.setEvents(event);
    users = [];
    e.target.reset();
    document.getElementById('users-active-list').innerHTML = '';
    document.getElementById('users-list').classList.add('hide');
    document.getElementById('create-event-modal').classList.remove('active');
    loadEvents();
  }
}

document
  .getElementById('create-event-form')
  .addEventListener('submit', handleCreateEvent);

// выбор пользователей

function handleAddUser(e, email) {
  e.preventDefault();

  const activeUsersList = document.getElementById('users-active-list');

  const activeUserTemplate = document.getElementById(
    'active-user-template',
  ).content;

  const activeUser = activeUserTemplate.querySelector('li').cloneNode(true);
  activeUser.querySelector('span').textContent = email;
  activeUser.querySelector('button').addEventListener('click', (e) => {
    e.preventDefault();
    activeUsersList.removeChild(activeUser);
    users = users.filter((elem) => elem != email);
  });
  if (!Array.from(activeUsersList.childNodes).includes(activeUser)) {
    activeUsersList.appendChild(activeUser);
    users.push(email);
  }
  console.log(users);
}

function setUsers(search) {
  const usersList = document.getElementById('users-list');
  usersList.innerHTML = '';
  let newUsers;
  if (search)
    newUsers = store.users
      .filter((elem) => elem.email.includes(search))
      .map((elem) => elem.email);
  else newUsers = store.users.map((elem) => elem.email);

  const userTemplate = document.getElementById('user-template').content;

  newUsers.forEach((email) => {
    const userBlock = userTemplate.cloneNode(true);
    userBlock.querySelector('button').textContent = email;
    userBlock
      .querySelector('button')
      .addEventListener('click', (e) => handleAddUser(e, email));
    usersList.appendChild(userBlock);
  });
}

function handleChangeUsersInput(e) {
  const usersList = document.getElementById('users-list');
  if (e.target.value != '') {
    usersList.classList.remove('hide');
    setUsers();
  } else {
    usersList.classList.add('hide');
    usersList.innerHTML == '';
  }
}

document
  .getElementById('users')
  .addEventListener('input', handleChangeUsersInput);

// обработка формы редактирования события

function setEditError(field) {
  document.getElementById('edit-' + field + '-error').classList.add('active');
}

function clearEditErrors(keys) {
  keys.forEach((key) => {
    document
      .getElementById('edit-' + key + '-error')
      .classList.remove('active');
  });
}

function validateFormEdit(event) {
  const keys = Object.keys(event).filter((key) => key != 'users');
  let errors = [];
  keys.forEach((key) => {
    if (event[key] == '') {
      setEditError(key);
      errors.push(key);
    }
  });
  clearEditErrors(keys.filter((key) => !errors.includes(key)));
  if (errors.length == 0) return true;
  else return false;
}

function handleEditEvent(e) {
  e.preventDefault();
  const event = Object.fromEntries(new FormData(e.target));
  if (validateFormEdit(event)) {
    store.editEvent(e.target.dataset.id, event);
    e.target.reset();
    document.getElementById('edit-event-modal').classList.remove('active');
    loadEvents();
  }
}

document
  .getElementById('edit-event-form')
  .addEventListener('submit', handleEditEvent);
