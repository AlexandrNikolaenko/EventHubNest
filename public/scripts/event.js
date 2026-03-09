import { store } from './api.js';
import Api from './http-api.js';

const eventId = Number(document.location.pathname.split('/')[2]);
console.log(document.location.pathname.split('/')[1])


const api = new Api();

function loadEvent() {
  api.getEvent(eventId, handleSuccess, handleError);

  function handleError(e) {
    console.log(e);
  }

  function handleSuccess(event) {
    const section = document.querySelector('.info-section');
  
    section.querySelector('.title').textContent = event.title;
    section.querySelector('.desc').textContent = event.desc;
    section.querySelector('.date').textContent = (new Date(event.date)).toLocaleDateString('ru-RU');
    section.querySelector('.place').textContent = event.place;
    section.querySelector('.author').textContent = event.author.email;
  
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    const userTemplate = document.getElementById('user-template').content;
    event.registrations.forEach((elem) => {
      const user = userTemplate.querySelector('li').cloneNode(true);
      user.textContent = elem.user.email;
      usersList.appendChild(user);
    });
  }
}

loadEvent();

// открытие и закрытие формы редактирования события

document
  .getElementById('edit-event-button')
  .addEventListener('click', handleOpenEditModal);

function handleOpenEditModal(e) {
  e.preventDefault();
  console.log(e);
  document.location.assign('/events/' + eventId + '/edit');
  // const form = document.getElementById('edit-event-form');

  // form.querySelector('#edit-title').value = event.title;
  // form.querySelector('#edit-desc').value = event.desc;
  // form.querySelector('#edit-date').value = event.date;
  // form.querySelector('#edit-place').value = event.place;
  // document.getElementById('edit-event-modal').classList.add('active');
}

function handleCloseEditModal(e) {
  e.preventDefault();
  document.getElementById('edit-event-modal').classList.remove('active');
}

document
  .getElementById('close-edit-modal')
  .addEventListener('click', handleCloseEditModal);

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
    store.editEvent(eventId, event);
    e.target.reset();
    document.getElementById('edit-event-modal').classList.remove('active');
    loadEvent();
  }
}

document
  .getElementById('edit-event-form')
  .addEventListener('submit', handleEditEvent);
