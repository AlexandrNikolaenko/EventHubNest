import { store, user } from './api.js';
import Api from './http-api.js';

if (!user.getUser().id) window.location.assign('/auth/login');
const api = new Api();

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
