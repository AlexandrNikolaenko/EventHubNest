import Api from './http-api.js';

const eventId = Number(document.location.pathname.split('/')[2]);

function loadEvent() {
  return new Promise((resolve, reject) => {
    const api = new Api();
    api.getPost(eventId, resolve, reject);
  });
}

function handleSuccess(data) {
  const section = document.querySelector('section');
  section.innerHTML = '';

  const postTemplate = document.getElementById('post-template').content;

  const post = postTemplate.cloneNode(true);
  post.querySelector('.post-media').style =
    'background-image: url(' + data.image + ')';
  post.querySelector('h6').textContent = data.title;
  post.querySelector('p').textContent = data.desc;
  post.querySelector('.date').textContent = new Date(
    elem.date,
  ).toLocaleDateString('ru-RU');
  post.querySelector('.place').textContent = data.place;

  section.appendChild(post);
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

function renderData() {
  loadEvent()
    .then((data) => {
      handleSuccess(data);
    })
    .catch(handleError);
}

renderData();
