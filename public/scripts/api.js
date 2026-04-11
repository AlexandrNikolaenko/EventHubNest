class UserSession {
  constructor(id = null) {
    this.id = id;
  }

  updateUser(id) {
    this.id = Number(id);
    window.localStorage.setItem('activeUser', String(this.id));
  }

  deleteUser() {
    this.id = null;
    window.localStorage.removeItem('activeUser');
  }

  getUser() {
    return {
      id: this.id,
    };
  }

  static initUser() {
    const savedId = window.localStorage.getItem('activeUser');
    const parsedId = savedId ? Number(savedId) : null;

    return new UserSession(Number.isNaN(parsedId) ? null : parsedId);
  }
}

export const user = UserSession.initUser();

export const store = {
  getEvents() {
    return [];
  },
  getEventById() {
    return null;
  },
  setEvents() {},
  editEvent() {},
  deleteEvents() {},
};

export function login() {
  throw new Error('Use Api.login for backend authentication.');
}

export function register() {
  throw new Error('Use Api.register for backend registration.');
}

export function logout(e) {
  e.preventDefault();
  user.deleteUser();
  window.location.assign('/auth/login');
}
