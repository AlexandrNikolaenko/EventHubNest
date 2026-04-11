import Api from './http-api.js';

const eventId = Number(document.location.pathname.split('/')[2]);
const api = new Api();
let editingReviewId = null;

function getCurrentUserId() {
  const id = window.localStorage.getItem('activeUser');
  if (!id) return null;
  const num = Number(id);
  return Number.isNaN(num) ? null : num;
}

function loadEvent() {
  api.getPost(
    eventId,
    (data) => {
      renderEvent(data);
      loadReviews();
    },
    (err) => {
      console.error('Event load error', err);
      handleError(err);
    },
  );
}

function renderEvent(data) {
  const section = document.querySelector('section');
  section.innerHTML = '';

  const postTemplate = document.getElementById('post-template').content;
  const post = postTemplate.cloneNode(true);

  post.querySelector('.post-media').style.backgroundImage =
    `url(${data.image})`;
  post.querySelector('h6').textContent = data.title;
  post.querySelector('p').textContent = data.desc;
  post.querySelector('.date').textContent = new Date(
    data.date,
  ).toLocaleDateString('ru-RU');
  post.querySelector('.place').textContent = data.place;

  section.appendChild(post);
}

function loadReviews() {
  api.getReviews(
    (reviews) => {
      renderReviews(Array.isArray(reviews) ? reviews : []);
    },
    (err) => {
      console.error('Reviews load error', err);
      const reviewsContainer = document.getElementById('reviews-list');
      if (reviewsContainer) {
        reviewsContainer.innerHTML =
          '<p class="body1">Не удалось загрузить отзывы.</p>';
      }
    },
    `?postId=${eventId}&limit=50`,
  );
}

function renderReviews(reviews) {
  const reviewsContainer = document.getElementById('reviews-list');
  if (!reviewsContainer) return;
  const currentUserId = getCurrentUserId();

  if (!reviews.length) {
    reviewsContainer.innerHTML =
      '<p class="body1">Пока нет отзывов о событии.</p>';
    return;
  }

  reviewsContainer.innerHTML = '';
  reviews.forEach((review) => {
    const reviewElem = document.createElement('div');
    reviewElem.className = 'review-item';
    const author = review.author?.email || 'Аноним';
    const rating = review.rating ? ` Рейтинг: ${review.rating}/5` : '';

    const meta = document.createElement('div');
    meta.className = 'review-meta';

    const authorElem = document.createElement('strong');
    authorElem.textContent = author;

    const dateElem = document.createElement('span');
    dateElem.textContent = new Date(review.createdAt).toLocaleString('ru-RU');

    const contentElem = document.createElement('p');
    contentElem.className = 'body1';
    contentElem.textContent = review.content;

    const ratingElem = document.createElement('p');
    ratingElem.className = 'body2';
    ratingElem.textContent = rating;

    meta.append(authorElem, dateElem);
    reviewElem.append(meta, contentElem, ratingElem);

    if (currentUserId && review.authorId === currentUserId) {
      const actions = document.createElement('div');
      actions.className = 'review-actions';

      const editButton = document.createElement('button');
      editButton.className = 'secondary';
      editButton.textContent = 'Редактировать';
      editButton.addEventListener('click', () => openEditReviewModal(review));

      const deleteButton = document.createElement('button');
      deleteButton.className = 'error';
      deleteButton.textContent = 'Удалить';
      deleteButton.addEventListener('click', () => deleteReview(review.id));

      actions.append(editButton, deleteButton);
      reviewElem.appendChild(actions);
    }

    reviewsContainer.appendChild(reviewElem);
  });
}

function showSuccess(message) {
  if (window.toastr) toastr.success(message);
  else alert(message);
}

function showFailure(message) {
  if (window.toastr) toastr.error(message);
  else alert(message);
}

function openEditReviewModal(review) {
  editingReviewId = review.id;
  document.getElementById('edit-review-content').value = review.content;
  document.getElementById('edit-review-rating').value = review.rating || '';
  document.getElementById('edit-review-modal').classList.add('active');
}

function closeEditReviewModal(e) {
  e.preventDefault();
  editingReviewId = null;
  document.getElementById('edit-review-form').reset();
  document.getElementById('edit-review-modal').classList.remove('active');
}

function handleEditReviewSubmit(e) {
  e.preventDefault();

  const authorId = getCurrentUserId();
  const content = document.getElementById('edit-review-content').value.trim();
  const ratingInput = document.getElementById('edit-review-rating').value;
  const rating = ratingInput ? Number(ratingInput) : undefined;

  if (!editingReviewId || !authorId) {
    showFailure('Войдите, чтобы редактировать отзыв.');
    return;
  }

  if (!content) {
    showFailure('Напишите текст отзыва.');
    return;
  }

  api.updateReview(
    () => {
      showSuccess('Отзыв обновлен');
      document.getElementById('edit-review-modal').classList.remove('active');
      document.getElementById('edit-review-form').reset();
      editingReviewId = null;
      loadReviews();
    },
    () => showFailure('Не удалось обновить отзыв'),
    editingReviewId,
    authorId,
    {
      content,
      rating,
    },
  );
}

function deleteReview(id) {
  const authorId = getCurrentUserId();

  if (!authorId) {
    showFailure('Войдите, чтобы удалить отзыв.');
    return;
  }

  api.deleteReview(
    () => {
      showSuccess('Отзыв удален');
      loadReviews();
    },
    () => showFailure('Не удалось удалить отзыв'),
    id,
    authorId,
  );
}

function handleError(e) {
  const error = document.getElementById('query-error');
  if (!error) return;

  let message = 'Что-то пошло не так.';
  if (e && e.message) {
    if (e.message === '500') message = 'Сервер не отвечает';
    if (e.message === '429') message = 'К сожалению, вы были заблокированы';
  }

  error.classList.remove('hide');
  error.textContent = message;
}

function handleReviewSubmit(e) {
  e.preventDefault();

  const content = document.getElementById('review-content')?.value.trim();
  const ratingInput = document.getElementById('review-rating')?.value;
  const rating = ratingInput ? Number(ratingInput) : undefined;
  const authorId = getCurrentUserId();

  if (!authorId) {
    showFailure('Пожалуйста, войдите, чтобы оставить отзыв.');
    return;
  }

  if (!content) {
    showFailure('Пожалуйста, напишите текст отзыва.');
    return;
  }

  const newReview = {
    content,
    rating: rating || undefined,
    authorId,
    postId: eventId,
  };

  api.createReview(
    () => {
      document.getElementById('review-form').reset();
      loadReviews();
      showSuccess('Отзыв успешно добавлен!');
    },
    (err) => {
      console.error('Review create error', err);
      showFailure('Не удалось добавить отзыв. Попробуйте позже.');
    },
    newReview,
  );
}

function initReviewForm() {
  const form = document.getElementById('review-form');
  if (!form) return;
  form.addEventListener('submit', handleReviewSubmit);
}

loadEvent();
initReviewForm();
document
  .getElementById('edit-review-form')
  .addEventListener('submit', handleEditReviewSubmit);
document
  .getElementById('close-edit-review-modal')
  .addEventListener('click', closeEditReviewModal);
