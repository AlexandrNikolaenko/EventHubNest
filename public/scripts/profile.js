import { user } from './api.js';
import Api from './http-api.js';

const api = new Api();
const currentUserId = Number(user.getUser().id);

if (!currentUserId) {
  window.location.assign('/auth/login');
}

function byId(id) {
  return document.getElementById(id);
}

function notifySuccess(message) {
  if (window.toastr) toastr.success(message);
}

function notifyError(message) {
  if (window.toastr) toastr.error(message);
}

function showError(message) {
  const error = byId('profile-error');
  error.textContent = message;
  error.classList.remove('hide');
  notifyError(message);
}

function renderUser(data) {
  byId('profile-name').textContent = data.name;
  byId('profile-id').textContent = data.id;
  byId('profile-user-name').textContent = data.name;
  byId('profile-email').textContent = data.email;
  byId('profile-avatar').src = data.avatar || '/default.png';
}

function createNotificationItem(notification) {
  const item = document.createElement('li');
  item.className = `notification-item${notification.isRead ? '' : ' unread'}`;

  const content = document.createElement('div');
  content.className = 'notification-content';

  const message = document.createElement('p');
  message.className = 'body1';
  message.textContent = notification.message;

  const date = document.createElement('span');
  date.textContent = new Date(notification.createdAt).toLocaleString('ru-RU');

  const actions = document.createElement('div');
  actions.className = 'notification-actions';

  const markReadButton = document.createElement('button');
  markReadButton.className = 'secondary';
  markReadButton.textContent = notification.isRead
    ? 'Прочитано'
    : 'В прочитанные';
  markReadButton.disabled = notification.isRead;
  markReadButton.addEventListener('click', () => {
    api.markNotificationAsRead(
      () => {
        notifySuccess('Уведомление отмечено как прочитанное');
        loadNotifications();
      },
      () => showError('Не удалось обновить уведомление'),
      notification.id,
      currentUserId,
    );
  });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'error';
  deleteButton.textContent = 'Удалить';
  deleteButton.addEventListener('click', () => {
    api.deleteNotification(
      () => {
        notifySuccess('Уведомление удалено');
        loadNotifications();
      },
      () => showError('Не удалось удалить уведомление'),
      notification.id,
      currentUserId,
    );
  });

  content.append(message, date);
  actions.append(markReadButton, deleteButton);
  item.append(content, actions);

  return item;
}

function renderNotifications(notifications) {
  const list = byId('notifications-list');
  const empty = byId('notifications-empty');
  list.innerHTML = '';

  if (!notifications.length) {
    empty.classList.remove('hide');
    return;
  }

  empty.classList.add('hide');
  notifications.forEach((notification) => {
    list.appendChild(createNotificationItem(notification));
  });
}

function loadUser() {
  api.getUser(
    renderUser,
    () => showError('Не удалось загрузить профиль'),
    currentUserId,
  );
}

function loadNotifications() {
  api.getNotifications(
    (notifications) =>
      renderNotifications(Array.isArray(notifications) ? notifications : []),
    () => showError('Не удалось загрузить уведомления'),
    currentUserId,
    { page: 1, limit: 50 },
  );
}

function handleAvatarSubmit(e) {
  e.preventDefault();

  const file = byId('avatar-input').files[0];
  if (!file) {
    showError('Выберите файл аватара');
    return;
  }

  const formData = new FormData();
  formData.append('avatar', file);

  api.updateAvatar(
    (data) => {
      renderUser(data);
      byId('avatar-form').reset();
      notifySuccess('Аватар обновлен');
    },
    () => showError('Не удалось обновить аватар'),
    currentUserId,
    formData,
  );
}

if (currentUserId) {
  const eventSource = new EventSource('/api/notifications/events');

  eventSource.onmessage = function (event) {
    const data = JSON.parse(event.data);

    if (data.type === 'notification') {
      notifySuccess(data.notification.message);
      loadNotifications();
    }
  };

  byId('refresh-notifications').addEventListener('click', loadNotifications);
  byId('avatar-form').addEventListener('submit', handleAvatarSubmit);

  loadUser();
  loadNotifications();
}
