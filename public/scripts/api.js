// event: {
//   id: number
//   title: string
//   date: string
//   author: string
//   desc: string
//   place: string
// }

class Store {
  constructor(users, events) {
    this.users = users;
    this.events = events;
  }

  static initStore() {
    const users = JSON.parse(localStorage.getItem('users'));
    const events = JSON.parse(localStorage.getItem('events'));
    return new Store(users || [], events || []);
  }

  setUser(user) {
    user.events = [];
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  updateStore() {
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('events', JSON.stringify(this.events));
  }

  getUserByEmail(email) {
    return this.users.find((user) => user.email == email);
  }

  getEventById(id) {
    return this.events.find((event) => event.id == id);
  }

  setEvents(event) {
    if (this.events.length != 0) {
      event.id = this.events[this.events.length - 1].id + 1;
    } else event.id = 0;
    if (!event.users.includes(user.email)) event.users.push(user.email);
    event.author = user.email;
    this.users = this.users.map((elem) => {
      if (event.users.includes(elem.email)) elem.events.push(event.id);
      return elem;
    });
    console.log(this.events, this.users);
    this.events.push(event);
    this.updateStore();
  }

  editEvent(id, event) {
    console.log(event);
    const index = this.events.findIndex((elem) => elem.id == id);
    this.events[index].title = event.title;
    this.events[index].desc = event.desc;
    this.events[index].date = event.date;
    this.events[index].place = event.place;
    this.updateStore();
  }

  getEvents() {
    return this.events.filter(
      (event) => event.author == user.email || event.users.includes(user.email),
    );
  }

  deleteEvents(id) {
    this.events = this.events.filter((event) => event.id != id);

    this.updateStore();
  }
}

class User {
  constructor() {
    this.name;
    this.email;
    this.password;
  }

  updateUser(email) {
    window.localStorage.setItem('activeUser', email);
    const user = store.getUserByEmail(email);
    this.email = user.email;
    this.name = user.name;
    this.password = user.password;
  }

  deleteUser() {
    [this.name, this.email, this.password] = [undefined, undefined, undefined];
    window.localStorage.removeItem('activeUser');
  }

  getUser() {
    return {
      name: this.name,
      email: this.email,
    };
  }

  static initUser() {
    const newUser = new User();
    if (window.localStorage.getItem('activeUser')) {
      newUser.updateUser(window.localStorage.getItem('activeUser'));
    }
    return newUser;
  }
}

export const store = Store.initStore();
export const user = User.initUser();

export function login({ password, email }) {
  const newUser = store.users.find((elem) => elem.email == email);
  if (newUser) {
    if (newUser.password == password) {
      user.updateUser(email);
      window.location.assign('/main');
      return;
    } else {
      throw new Error(
        JSON.stringify({ type: 'password', message: 'Неверный пароль' }),
      );
    }
  } else {
    throw new Error(
      JSON.stringify({
        type: 'email',
        message: 'Пользователя с такой почтой не существует',
      }),
    );
  }
}

export function register({ name, email, password }) {
  const checkUser = store.users.find((user) => user.email == email);
  if (checkUser) {
    throw new Error(
      JSON.stringify({
        type: 'email',
        message: 'Пользователь с такой почтой уже существует',
      }),
    );
  } else {
    store.setUser({ name, email, password });
    user.updateUser(email);
    window.location.assign('/main');
    return;
  }
}

export function logout(e) {
  e.preventDefault();
  console.log('here');
  user.deleteUser();
  window.location.reload();
}
