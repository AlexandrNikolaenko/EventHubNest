// форма регистрации

import Api from './http-api.js';
import { user } from './api.js';

// ==========================================
// НАБОР ПРАВИЛ ДЛЯ ВАЛИДАЦИИ
// ==========================================

const constraints = {
  name: {
    presence: { allowEmpty: false, message: 'Поле обязательно' },
  },

  email: {
    presence: { allowEmpty: false, message: 'Поле обязательно' },
    email: { message: 'Введите корректный email' },
  },

  password: {
    presence: { allowEmpty: false, message: 'Поле обязательно' },
    length: {
      minimum: 8,
      message: 'Пароль должен быть не короче 8 символов',
    },
  },

  repassword: {
    presence: { allowEmpty: false, message: 'Подтвердите пароль' },
    equality: {
      attribute: 'password',
      message: 'Пароли не совпадают',
    },
  },
};

const formRegister = document.getElementById('register');

// function validation(values) {
//   let errors = [];
//   if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)) {
//     errors.push({ type: "email", message: "Некорректная почта" });
//   }
//   if (values.password.length < 8) {
//     errors.push({
//       type: "password",
//       message: "Пароль должен содержать не менее 8 символов",
//     });
//   }
//   if (values.password != values.repassword) {
//     errors.push({ type: "repassword", message: "Пароли должны совпадать" });
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
  console.log(data);
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
      new Api().register(values, onSuccess, onError);
    } catch (err) {
      console.log(err);
    }
  }
}

formRegister.addEventListener('submit', handleSubmit);
