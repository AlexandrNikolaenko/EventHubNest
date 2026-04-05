import Api from './http-api.js';

const eventId = Number(document.location.pathname.split('/')[2]);
const api = new Api();

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

  post.querySelector('.post-media').style.backgroundImage = `url(${data.image})`;
  post.querySelector('h6').textContent = data.title;
  post.querySelector('p').textContent = data.desc;
  post.querySelector('.date').textContent = new Date(data.date).toLocaleDateString('ru-RU');
  post.querySelector('.place').textContent = data.place;

  section.appendChild(post);
}

function loadReviews() {
  api.getReviews(
    (reviews) => {
      const postReviews = Array.isArray(reviews)
        ? reviews.filter((r) => r.postId === eventId)
        : [];
      renderReviews(postReviews);
    },
    (err) => {
      console.error('Reviews load error', err);
      const reviewsContainer = document.getElementById('reviews-list');
      if (reviewsContainer) {
        reviewsContainer.innerHTML = '<p class="body1">Не удалось загрузить отзывы.</p>';
      }
    },
  );
}

function renderReviews(reviews) {
  const reviewsContainer = document.getElementById('reviews-list');
  if (!reviewsContainer) return;

  if (!reviews.length) {
    reviewsContainer.innerHTML = '<p class="body1">Пока нет отзывов о событии.</p>';
    return;
  }

  reviewsContainer.innerHTML = '';
  reviews.forEach((review) => {
    const reviewElem = document.createElement('div');
    reviewElem.className = 'review-item';
    const author = review.author?.email || 'Аноним';
    const rating = review.rating ? ` Рейтинг: ${review.rating}/5` : '';

    reviewElem.innerHTML = `
      <div class="review-meta">
        <strong>${author}</strong><span>${new Date(review.createdAt).toLocaleString('ru-RU')}</span>
      </div>
      <p class="body1">${review.content}</p>
      <p class="body2">${rating}</p>
    `;

    reviewsContainer.appendChild(reviewElem);
  });
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
    alert('Пожалуйста, войдите, чтобы оставить отзыв.');
    return;
  }

  if (!content) {
    alert('Пожалуйста, напишите текст отзыва.');
    return;
  }

  const newReview = {
    content,
    rating: rating || undefined,
    authorId,
    postId: eventId,
  };

  api.createReview(
    (saved) => {
      document.getElementById('review-form').reset();
      loadReviews();
      alert('Отзыв успешно добавлен!');
    },
    (err) => {
      console.error('Review create error', err);
      alert('Не удалось добавить отзыв. Попробуйте позже.');
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
