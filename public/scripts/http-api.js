class HttpRequest {
  #api_host;

  constructor() {
    // this.#api_host = 'https://eventhubnest.onrender.com/api';
    this.#api_host = 'http://localhost:3000/api';
  }

  async get({ onError, onSuccess, query }) {
    let redirectPath = '';
    try {
      const res = await fetch(this.#api_host.concat(query), {
        method: 'GET',
        cache: 'no-cache',
      });
      if (res.ok) {
        const data = await res.json();
        if (onSuccess) onSuccess(data);
        return data;
      } else throw new Error(await res.json());
    } catch (e) {
      console.log(e);
      if (onError) onError(e);
      if (e.message == '401') redirectPath = '/auth/login';
      return e;
    } finally {
      if (redirectPath != '') window.location.assign(redirectPath);
    }
  }

  async post({ onError, onSuccess, query, body }) {
    let redirectPath = '';
    try {
      const res = await fetch(this.#api_host.concat(query), {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        if (onSuccess) onSuccess(data);
        return data;
      } else {
        if (onError) onError(data);
        throw new Error(res.status);
      }
    } catch (e) {
      console.log(e);
      return e;
    } finally {
      if (redirectPath != '') window.location.assign(redirectPath);
    }
  }

  async put({ onError, onSuccess, body, query }) {
    let redirectPath = '';
    try {
      const res = await fetch(this.#api_host.concat(query), {
        method: 'PUT',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (onSuccess) onSuccess(data);
        return data;
      } else throw new Error(await res.json());
    } catch (e) {
      console.log(e);
      if (onError) onError(e);
      if (e.message == '401') redirectPath = '/auth/login';
      return e;
    } finally {
      if (redirectPath != '') window.location.assign(redirectPath);
    }
  }

  async patch({ onError, onSuccess, body, query }) {
    let redirectPath = '';
    try {
      const res = await fetch(this.#api_host.concat(query), {
        method: 'PATCH',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (onSuccess) onSuccess(data);
        return data;
      } else throw new Error(await res.json());
    } catch (e) {
      console.log(e);
      if (onError) onError(e);
      if (e.message == '401') redirectPath = '/auth/login';
      return e;
    } finally {
      if (redirectPath != '') window.location.assign(redirectPath);
    }
  }

  async delete({ onError, onSuccess, query }) {
    let redirectPath = '';
    try {
      const res = await fetch(this.#api_host.concat(query), {
        method: 'DELETE',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (onSuccess) onSuccess(data);
        return data;
      } else throw new Error(await res.json());
    } catch (e) {
      console.log(e);
      if (onError) onError(e);
      if (e.message == '401') redirectPath = '/auth/login';
      return e;
    } finally {
      if (redirectPath != '') window.location.assign(redirectPath);
    }
  }
}

export default class Api {
  #httpRequest;

  constructor() {
    this.#httpRequest = new HttpRequest();
  }

  async searchUsers(onSuccess, onError, email) {
    return await this.#httpRequest.get({
      query: '/users/search?email=' + email,
      onSuccess,
      onError,
    });
  }

  async editEvent(onSuccess, onError, body, id) {
    return await this.#httpRequest.patch({
      query: '/events/' + id,
      onSuccess,
      onError,
      body,
    });
  }

  async deleteEvent(onSuccess, onError, id) {
    return await this.#httpRequest.delete({
      query: '/events/' + id,
      onSuccess,
      onError,
    });
  }

  async createEvents(onSuccess, onError, body) {
    return await this.#httpRequest.post({
      query: '/events',
      onSuccess,
      onError,
      body,
    });
  }

  async getEvents(onSuccess, onError, userId) {
    return await this.#httpRequest.get({
      query: '/events' + (userId ? `?userId=${userId}` : ''),
      onSuccess,
      onError,
    });
  }

  async getEvent(id, onSuccess, onError) {
    return await this.#httpRequest.get({
      query: '/events/' + id,
      onSuccess,
      onError,
    });
  }

  async getPosts(onSuccess, onError, query = '') {
    return await this.#httpRequest.get({
      query: '/posts' + query,
      onSuccess,
      onError,
    });
  }

  async getPost(id, onSuccess, onError) {
    return await this.#httpRequest.get({
      query: '/posts/' + id,
      onSuccess,
      onError,
    });
  }

  async login({ email, password }, onSuccess, onError) {
    return await this.#httpRequest.post({
      body: { email, password },
      query: '/auth/login',
      onSuccess,
      onError,
    });
  }

  async register({ name, email, password }, onSuccess, onError) {
    return await this.#httpRequest.post({
      body: { name, email, password },
      query: '/auth/register',
      onSuccess,
      onError,
    });
  }
}
