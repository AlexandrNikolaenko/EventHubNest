import { store, user } from './api.js';
import Api from './http-api.js';

if (!user.getUser().id) window.location.assign('/auth/login');
const api = new Api();

// открытие и закрытие формы редактирования события

function handleOpenEditModal(id) {
  // const event = store.getEventById(id);
  function handleSuccess(event) {
    const form = document.getElementById('edit-event-form');
    form.dataset.id = id;
    form.querySelector('#edit-title').value = event.title;
    form.querySelector('#edit-desc').value = event.desc;
    form.querySelector('#edit-date').value = (new Date(event.date)).toLocaleDateString('ru-RU');
    form.querySelector('#edit-place').value = event.place;
    document.getElementById('edit-event-modal').classList.add('active');
  }

  function handleError(e) {
    console.log(e);
  }

  api.getEvent(id, handleSuccess, handleError);
}

const eventId = Number(document.location.pathname.split('/')[2])

handleOpenEditModal(eventId)

function handleCloseEditModal(e) {
  e.preventDefault();
  document.getElementById('edit-event-modal').classList.remove('active');
  document.location.assign('/events')
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

  function handleSuccess() {
    e.target.reset();
    document.getElementById('edit-event-modal').classList.remove('active');
    document.location.assign('/events');
  }

  function handleError(e) {
    console.log(e);
  }

  if (validateFormEdit(event)) {
    const body = {
      authorId: Number(user.getUser().id),
      dto: event
    }
    api.editEvent(handleSuccess, handleError, body, eventId);
    // store.editEvent(e.target.dataset.id, event);
  }
}

document
  .getElementById('edit-event-form')
  .addEventListener('submit', handleEditEvent);
