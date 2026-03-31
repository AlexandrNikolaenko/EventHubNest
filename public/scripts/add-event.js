import { store, user } from './api.js';
import Api from './http-api.js';

if (!user.getUser().id) window.location.assign('/auth/login');
const api = new Api();

function handleCloseCreatorModal(e) {
  e.preventDefault();
  // document.getElementById('create-event-modal').classList.remove('active');
  document.location.assign('/events');
}

document
  .getElementById('close-cretor-modal')
  .addEventListener('click', handleCloseCreatorModal);

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

  function handleSuccess() {
    users = [];
    e.target.reset();
    document.getElementById('users-active-list').innerHTML = '';
    document.getElementById('users-list').classList.add('hide');
    document.getElementById('create-event-modal').classList.remove('active');
    document.location.assign('/events');
  }

  function handleError(e) {
    console.log(e);
  }

  if (validateFormCreate(event)) {
    event.users = users;
    const body = {
      authorId: Number(user.getUser().id),
      data: event,
    };
    // store.setEvents(event);
    api.createEvents(handleSuccess, handleError, body);
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
  if (!users.includes(email)) {
    activeUsersList.appendChild(activeUser);
    users.push(email);
  }
  console.log(users);
}

function setUsers(search) {
  const usersList = document.getElementById('users-list');
  api.searchUsers(handleSuccess, (e) => console.log(e), search);

  function handleSuccess(data) {
    let newUsers = data.map((elem) => elem.email);

    if (newUsers.length == 0) {
      usersList.classList.add('hide');
      return;
    } else usersList.classList.remove('hide');

    const userTemplate = document.getElementById('user-template').content;

    usersList.innerHTML = '';
    newUsers.forEach((email) => {
      console.log(email);
      const userBlock = userTemplate.cloneNode(true);
      userBlock.querySelector('button').textContent = email;
      userBlock
        .querySelector('button')
        .addEventListener('click', (e) => handleAddUser(e, email));
      usersList.appendChild(userBlock);
    });
  }
}

function handleChangeUsersInput(e) {
  const usersList = document.getElementById('users-list');
  if (e.target.value != '') {
    setUsers(e.target.value);
  } else {
    usersList.classList.add('hide');
    usersList.innerHTML == '';
  }
}

document
  .getElementById('users')
  .addEventListener('input', handleChangeUsersInput);
