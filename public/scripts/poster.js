import Api from './http-api.js';

const list = document.getElementById('poster-list');
const preloader = list.innerHTML;
const postTemplate = document.getElementById('post-template').content;

function loadPoster(search = '') {
  return new Promise((resolve, reject) => {
    const api = new Api();
    api.getPosts(resolve, reject, search);
  });
}

const eventSource = new EventSource('/api/posts/events');

eventSource.onmessage = function (event) {
  const data = JSON.parse(event.data);
  console.log(data);

  switch (data.type) {
    case 'post_created':
      toastr.success("Post created");
      loadPoster();
      break;

    case 'post_update':
      toastr.info("Post updated");
      loadPoster();
      break;

    case 'post_deleted':
      toastr.warning("Post deleted");
      loadPoster();
      break;

    default:
      loadPoster();
  }
};

function handleSuccess(data) {
  list.innerHTML = '';

  data.forEach((elem) => {
    const post = postTemplate.cloneNode(true);
    post.querySelector('.post-media').style =
      'background-image: url(' + elem.image + ')';
    post.querySelector('h6').textContent = elem.title;
    post.querySelector('p').textContent = elem.desc;
    post.querySelector('.date').textContent = (new Date(elem.date)).toLocaleDateString('ru-RU');
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

function load(title) {
  loadPoster(title ? '?title=' + encodeURI(title) : '')
    .then((data) => {
      handleSuccess(data);
    })
    .catch(handleError);
}

load();

function handleSubmit(e) {
  e.preventDefault();
  const title = Object.fromEntries(new FormData(e.target)).search;
  load(title);
  e.target.reset();
}

document.getElementById('search-form').addEventListener('submit', handleSubmit);
