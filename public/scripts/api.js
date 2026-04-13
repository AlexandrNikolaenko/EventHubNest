class UserSession {
  constructor(user = null) {
    this.user = user;
  }

  updateUser(user) {
    this.user = user;
    window.__currentUser = user;
  }

  deleteUser() {
    this.user = null;
    window.__currentUser = null;
  }

  getUser() {
    return {
      ...(this.user || {}),
    };
  }

  static initUser() {
    return new UserSession(window.__currentUser || null);
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
  fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  }).finally(() => {
    user.deleteUser();
    window.location.assign('/auth/login');
  });
}
