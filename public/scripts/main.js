import { user } from './api.js';
import Api from './http-api.js';

if (!user.getUser().id) window.location.assign('/auth/login');

const api = new Api();
const currentUserId = Number(user.getUser().id);
let selectedUsers = [];
let loadedEvents = [];
let viewMode = 'list';

const eventSource = new EventSource('/api/notifications/events');

eventSource.onmessage = function (event) {
  const data = JSON.parse(event.data);

  if (data.type === 'notification' && window.toastr) {
    toastr.success(data.notification.message);
  }
};

function byId(id) {
  return document.getElementById(id);
}

function bind(id, event, handler) {
  const element = byId(id);
  if (element) element.addEventListener(event, handler);
}

function showMessage(id, text) {
  const element = byId(id);
  if (!element) return;
  element.textContent = text;
  element.classList.remove('hide');
}

function getAuthorEmail(event) {
  return event.author?.email || `user #${event.authorId}`;
}

function getEventImage(event) {
  return event.image || '/images/theatre.jpg';
}

function updateVisibility() {
  const list = byId('events-list');
  const table = byId('events-table');
  const empty = byId('events__empty');

  if (!list || !table || !empty) return;

  const hasEvents = loadedEvents.length > 0;
  empty.classList.toggle('hide', hasEvents);
  list.classList.toggle('hide', !hasEvents || viewMode !== 'list');
  table.classList.toggle('hide', !hasEvents || viewMode !== 'table');
}

function renderEvents(events) {
  loadedEvents = events;

  const list = byId('events-list');
  const tableBody = byId('events-table-body');
  if (!list || !tableBody) return;

  list.innerHTML = '';
  tableBody.innerHTML = '';

  if (!events.length) {
    updateVisibility();
    return;
  }

  const eventTemplate = byId('event-card-template').content;
  const eventRowTemplate = byId('event-table-row-template').content;

  events.forEach((event) => {
    const eventCard = eventTemplate.cloneNode(true);
    eventCard.querySelector('.card-media').style.background =
      `url(${getEventImage(event)}) center / cover`;
    eventCard.querySelector('.card-header').textContent = event.title;
    eventCard.querySelector('.event-author').textContent =
      getAuthorEmail(event);
    eventCard.querySelector('.event-description').textContent = event.desc;
    eventCard.querySelector('.event-date').textContent = new Date(
      event.date,
    ).toLocaleDateString('ru-RU');
    eventCard.querySelector('.event-place').textContent = event.place;
    eventCard
      .querySelector('.event-button')
      .setAttribute('href', `/events/${event.id}`);
    eventCard
      .querySelector('.remove-button')
      .addEventListener('click', (e) => handleRemoveEvent(e, event.id));
    eventCard
      .querySelector('.edit-event-button')
      .addEventListener('click', (e) => handleOpenEditModal(e, event.id));
    list.appendChild(eventCard);

    const eventRow = eventRowTemplate.cloneNode(true);
    eventRow.querySelector('.cell-id').textContent = event.id;
    eventRow.querySelector('.cell-title').textContent = event.title;
    eventRow.querySelector('.cell-desc').textContent = event.desc;
    eventRow.querySelector('.cell-author').textContent = getAuthorEmail(event);
    eventRow.querySelector('.cell-date').textContent = new Date(
      event.date,
    ).toLocaleDateString('ru-RU');
    eventRow.querySelector('.cell-place').textContent = event.place;
    tableBody.appendChild(eventRow);
  });

  updateVisibility();
}

function handleLoadError(e) {
  console.error(e);
  showMessage('query-error', 'Server request failed.');
}

function loadEvents(search = '') {
  api.getEvents(
    (events) => {
      const normalizedSearch = search.trim().toLowerCase();
      const filteredEvents = normalizedSearch
        ? events.filter((event) =>
            event.title.toLowerCase().includes(normalizedSearch),
          )
        : events;

      renderEvents(filteredEvents);
    },
    handleLoadError,
    currentUserId,
    { page: 1, limit: 50 },
  );
}

function handleChangeVision(param) {
  viewMode = param;
  updateVisibility();
}

bind('by-list', 'click', () => handleChangeVision('list'));
bind('by-table', 'click', () => handleChangeVision('table'));

function handleRemoveEvent(e, id) {
  e.preventDefault();
  api.deleteEvent(() => loadEvents(), handleLoadError, id);
}

function handleSearch(e) {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  loadEvents(formData.search || '');
}

bind('search-form', 'submit', handleSearch);

function handleOpenCreatorModal(e) {
  e.preventDefault();
  document.location.assign('/events/add');
}

function handleCloseCreatorModal(e) {
  e.preventDefault();
  document.location.assign('/events');
}

bind('close-cretor-modal', 'click', handleCloseCreatorModal);
document
  .querySelector('.create-event')
  ?.addEventListener('click', handleOpenCreatorModal);

function handleOpenGeneratorModal(e) {
  e.preventDefault();
  byId('generate-event-modal')?.classList.add('active');
}

function handleCloseGeneratorModal(e) {
  e.preventDefault();
  byId('generate-event-modal')?.classList.remove('active');
}

bind('close-generator-modal', 'click', handleCloseGeneratorModal);
document
  .querySelector('.gen-event')
  ?.addEventListener('click', handleOpenGeneratorModal);

function handleOpenEditModal(e, id) {
  e.preventDefault();
  document.location.assign('/events/' + id + '/edit');
}

function handleCloseEditModal(e) {
  e.preventDefault();
  byId('edit-event-modal')?.classList.remove('active');
}

bind('close-edit-modal', 'click', handleCloseEditModal);

function setError(field) {
  byId(field + '-error')?.classList.add('active');
}

function clearErrors(keys) {
  keys.forEach((key) => {
    byId(key + '-error')?.classList.remove('active');
  });
}

function validateFormCreate(event) {
  const keys = Object.keys(event).filter((key) => key !== 'users');
  const errors = keys.filter((key) => event[key] === '');
  errors.forEach(setError);
  clearErrors(keys.filter((key) => !errors.includes(key)));
  return errors.length === 0;
}

function handleCreateEvent(e) {
  e.preventDefault();
  const event = Object.fromEntries(new FormData(e.target));

  if (!validateFormCreate(event)) return;

  api.createEvents(
    () => {
      selectedUsers = [];
      e.target.reset();
      byId('users-active-list').innerHTML = '';
      byId('users-list').classList.add('hide');
      byId('create-event-modal')?.classList.remove('active');
      loadEvents();
    },
    handleLoadError,
    {
      authorId: currentUserId,
      data: {
        title: event.title,
        desc: event.desc,
        date: event.date,
        place: event.place,
        users: selectedUsers,
      },
    },
  );
}

bind('create-event-form', 'submit', handleCreateEvent);

function handleAddUser(e, email) {
  e.preventDefault();

  if (selectedUsers.includes(email)) return;

  const activeUsersList = byId('users-active-list');
  const activeUserTemplate = byId('active-user-template').content;
  const activeUser = activeUserTemplate.querySelector('li').cloneNode(true);

  activeUser.querySelector('span').textContent = email;
  activeUser.querySelector('button').addEventListener('click', (e) => {
    e.preventDefault();
    activeUsersList.removeChild(activeUser);
    selectedUsers = selectedUsers.filter((elem) => elem !== email);
  });

  activeUsersList.appendChild(activeUser);
  selectedUsers.push(email);
}

function setUsers(search) {
  const usersList = byId('users-list');
  usersList.innerHTML = '';

  api.searchUsers(
    (users) => {
      if (!users.length) {
        usersList.classList.add('hide');
        return;
      }

      const userTemplate = byId('user-template').content;
      usersList.classList.remove('hide');
      users.forEach(({ email }) => {
        const userBlock = userTemplate.cloneNode(true);
        userBlock.querySelector('button').textContent = email;
        userBlock
          .querySelector('button')
          .addEventListener('click', (e) => handleAddUser(e, email));
        usersList.appendChild(userBlock);
      });
    },
    handleLoadError,
    search,
  );
}

function handleChangeUsersInput(e) {
  const usersList = byId('users-list');
  if (e.target.value !== '') {
    setUsers(e.target.value);
  } else {
    usersList.classList.add('hide');
    usersList.innerHTML = '';
  }
}

bind('users', 'input', handleChangeUsersInput);

function setEditError(field) {
  byId('edit-' + field + '-error')?.classList.add('active');
}

function clearEditErrors(keys) {
  keys.forEach((key) => {
    byId('edit-' + key + '-error')?.classList.remove('active');
  });
}

function validateFormEdit(event) {
  const keys = Object.keys(event).filter((key) => key !== 'users');
  const errors = keys.filter((key) => event[key] === '');
  errors.forEach(setEditError);
  clearEditErrors(keys.filter((key) => !errors.includes(key)));
  return errors.length === 0;
}

function handleEditEvent(e) {
  e.preventDefault();
  const event = Object.fromEntries(new FormData(e.target));

  if (!validateFormEdit(event)) return;

  api.editEvent(
    () => {
      e.target.reset();
      byId('edit-event-modal')?.classList.remove('active');
      loadEvents();
    },
    handleLoadError,
    {
      authorId: currentUserId,
      dto: {
        title: event.title,
        desc: event.desc,
        date: event.date,
        place: event.place,
      },
    },
    e.target.dataset.id,
  );
}

bind('edit-event-form', 'submit', handleEditEvent);

loadEvents();
