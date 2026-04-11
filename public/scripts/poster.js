import Api from './http-api.js';

const list = document.getElementById('poster-list');
const preloader = list.innerHTML;
const postTemplate = document.getElementById('post-template').content;

let currentPage = 1;
let pageSize = 10;
let lastLoadedCount = 0;
let currentSearch = '';

function loadPoster(search = '', page = 1, limit = 10) {
  const query = `?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
  return new Promise((resolve, reject) => {
    const api = new Api();
    api.getPosts(resolve, reject, query);
  });
}

const eventSource = new EventSource('/api/posts/events');

eventSource.onmessage = function (event) {
  const data = JSON.parse(event.data);
  console.log(data);

  switch (data.type) {
    case 'post_created':
      toastr.success('Post created');
      load(currentSearch);
      break;

    case 'post_update':
      toastr.info('Post updated');
      load(currentSearch);
      break;

    case 'post_deleted':
      toastr.warning('Post deleted');
      load(currentSearch);
      break;

    default:
      load(currentSearch);
  }
};

function handleSuccess(data) {
  list.innerHTML = '';

  if (!data.length) {
    document.getElementById('poster__empty').classList.remove('hide');
    return;
  }

  document.getElementById('poster__empty').classList.add('hide');

  data.forEach((elem) => {
    const post = postTemplate.cloneNode(true);
    post.querySelector('.post-media').style =
      'background-image: url(' + elem.image + ')';
    post.querySelector('h6').textContent = elem.title;
    post.querySelector('p').textContent = elem.desc;
    post.querySelector('.date').textContent = new Date(
      elem.date,
    ).toLocaleDateString('ru-RU');
    post.querySelector('.place').textContent = elem.place;
    post.querySelector('a').setAttribute('href', '/posts/' + elem.id);

    list.appendChild(post);
  });
}

function handleError(e) {
  const error = document.getElementById('query-error');
  let message = ':(';
  error.classList.remove('hide');
  switch (e.message) {
    case '500':
      message = 'Сервер не отвечает' + message;
    case '429':
      message = 'К сожалению, вы были заблокированы' + message;
  }
}

// console.log(await loadPoster());

function updatePaginationControls(dataLength) {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageLabel = document.getElementById('current-page');

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = dataLength < pageSize;
  pageLabel.textContent = `Страница ${currentPage}`;
}

function load(title) {
  currentSearch = title || '';
  loadPoster(currentSearch, currentPage, pageSize)
    .then((data) => {
      lastLoadedCount = Array.isArray(data) ? data.length : 0;
      updatePaginationControls(lastLoadedCount);
      handleSuccess(data);
    })
    .catch(handleError);
}

load();

function handleSubmit(e) {
  e.preventDefault();
  const title = Object.fromEntries(new FormData(e.target)).search;
  currentPage = 1;
  load(title);
  e.target.reset();
}

document.getElementById('search-form').addEventListener('submit', handleSubmit);

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage <= 1) return;
  currentPage -= 1;
  load(currentSearch);
});

document.getElementById('next-page').addEventListener('click', () => {
  if (lastLoadedCount < pageSize) return;
  currentPage += 1;
  load(currentSearch);
});

document.getElementById('page-size').addEventListener('change', (e) => {
  pageSize = Number(e.target.value);
  currentPage = 1;
  load(currentSearch);
});
