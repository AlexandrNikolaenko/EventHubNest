// форма входа

import { login } from './api.js';
import Api from './http-api.js';
import { user } from './api.js';

const formLogin = document.getElementById('login');

const constraints = {
  email: {
    presence: { allowEmpty: false, message: 'Поле обязательно' },
    email: { message: 'Введите корректный email' },
  },
};

// function validation(values) {
//   let errors = [];
//   if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)) {
//     errors.push({ type: "email", message: "Некорректная почта" });
//   }
//   return errors;
// }

function initState() {
  const messages = document.getElementsByTagName('span');

  Array.from(messages).forEach((message) => {
    message.classList.remove('active');
  });
}

function onSuccess(data) {
  user.updateUser(data.userId);
  window.location.assign('/events');
  return;
}

function onError(err) {
  try {
    console.log(err);
    const message = document.getElementById(err.type + '-error');
    message.classList.add('active');
    message.textContent = err.message;
  } catch (e) {
    console.log(e);
  }
}

function handleSubmit(e) {
  e.preventDefault();
  initState();
  const values = Object.fromEntries(new FormData(e.target));
  const errors = validate(values, constraints);
  if (errors && Object.keys(errors) != 0) {
    Object.keys(errors).forEach((key) => {
      const error = errors[key];
      const message = document.getElementById(key + '-error');
      message.classList.add('active');
      message.textContent = error[0].split(' ').slice(1).join(' ');
    });
  } else {
    try {
      new Api().login(values, onSuccess, onError);
    } catch (err) {
      console.log(err);
    }
  }
}

formLogin.addEventListener('submit', handleSubmit);
