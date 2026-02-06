// форма входа

import { login } from './api.js';

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
      login(values);
    } catch (err) {
      try {
        const error = JSON.parse(err.message);
        const message = document.getElementById(error.type + '-error');
        message.classList.add('active');
        message.textContent = error.message;
      } catch (e) {
        console.log(e);
      }
    }
  }
}

formLogin.addEventListener('submit', handleSubmit);
