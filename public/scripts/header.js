import { logout, user } from './api.js';

// подсвечивание активной страницы

const links = document.getElementsByClassName('nav_link');
const navBarLinks = document.getElementsByClassName('nav_bar__link');
const page = document.location.pathname;

Array.from(links).forEach((link) => {
  if (
    (page == '/' && link.getAttribute('href') == '/') ||
    ((page == '/events/' || page == '/events') &&
      link.getAttribute('href') == '/events') ||
    ((page == '/about/' || page == '/about') &&
      link.getAttribute('href') == '/about') ||
    ((page == '/posts/' || page == '/posts') &&
      link.getAttribute('href') == '/posts') ||
    ((page == '/profile/' || page == '/profile') &&
      link.getAttribute('href') == '/profile')
  ) {
    link.classList.add('active');
  }
});

Array.from(navBarLinks).forEach((link) => {
  if (
    ((page == '/' || page == '/') && link.getAttribute('href') == '/') ||
    ((page == '/events/' || page == '/events') &&
      link.getAttribute('href') == '/events') ||
    ((page == '/about/' || page == '/about') &&
      link.getAttribute('href') == '/about') ||
    ((page == '/posts/' || page == '/posts') &&
      link.getAttribute('href') == '/posts') ||
    ((page == '/profile/' || page == '/profile') &&
      link.getAttribute('href') == '/profile')
  ) {
    link.classList.add('active');
  }
});

// вход в аккаунт и выход из аккаунта пользователя

if (user.getUser().id) {
  const links = document.getElementsByClassName('logout');
  Array.from(links).forEach((link) => {
    link.classList.add('active');
    link.addEventListener('click', logout);
  });
  const buttons = document.getElementsByClassName('header__button-enter');
  Array.from(buttons).forEach((button) => {
    button.classList.add('hide');
  });
}
