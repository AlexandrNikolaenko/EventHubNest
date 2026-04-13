class HttpRequest {
  #api_host;

  constructor() {
    this.#api_host = '/api';
  }

  async #request({ method, query, body, onSuccess, onError }) {
    let payload;
    const isFormData = body instanceof FormData;

    try {
      const res = await fetch(this.#api_host.concat(query), {
        method,
        credentials: 'same-origin',
        cache: method === 'GET' ? 'default' : 'no-store',
        headers: body && !isFormData
          ? {
              'Content-Type': 'application/json',
            }
          : undefined,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      });

      const text = await res.text();
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = text;
      }

      if (!res.ok) {
        const error =
          payload && typeof payload === 'object'
            ? { ...payload }
            : { message: payload || String(res.status) };
        error.status = res.status;
        error.message = error.message || String(res.status);
        throw error;
      }

      if (onSuccess) onSuccess(payload);
      return payload;
    } catch (e) {
      if (onError) onError(e);
      if (e.status === 401) window.location.assign('/auth/login');
      return e;
    }
  }

  async get({ onError, onSuccess, query }) {
    return this.#request({ method: 'GET', query, onSuccess, onError });
  }

  async post({ onError, onSuccess, query, body }) {
    return this.#request({ method: 'POST', query, body, onSuccess, onError });
  }

  async put({ onError, onSuccess, body, query }) {
    return this.#request({ method: 'PUT', query, body, onSuccess, onError });
  }

  async patch({ onError, onSuccess, body, query }) {
    return this.#request({ method: 'PATCH', query, body, onSuccess, onError });
  }

  async delete({ onError, onSuccess, query }) {
    return this.#request({ method: 'DELETE', query, onSuccess, onError });
  }
}

function params(query) {
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });

  const value = search.toString();
  return value ? `?${value}` : '';
}

export default class Api {
  #httpRequest;

  constructor() {
    this.#httpRequest = new HttpRequest();
  }

  async searchUsers(onSuccess, onError, email) {
    return await this.#httpRequest.get({
      query: `/users/search${params({ email })}`,
      onSuccess,
      onError,
    });
  }

  async getUser(onSuccess, onError, id) {
    return await this.#httpRequest.get({
      query: '/users/' + id,
      onSuccess,
      onError,
    });
  }

  async getSession(onSuccess, onError) {
    return await this.#httpRequest.get({
      query: '/auth/me',
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

  async getEvents(onSuccess, onError, userId, query = {}) {
    return await this.#httpRequest.get({
      query: '/events' + params({ userId, ...query }),
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

  async getReviews(onSuccess, onError, query = '') {
    return await this.#httpRequest.get({
      query: '/reviews' + query,
      onSuccess,
      onError,
    });
  }

  async createReview(onSuccess, onError, body) {
    return await this.#httpRequest.post({
      query: '/reviews',
      onSuccess,
      onError,
      body,
    });
  }

  async updateReview(onSuccess, onError, id, userId, body) {
    return await this.#httpRequest.patch({
      query: `/reviews/${id}${params({ userId })}`,
      body,
      onSuccess,
      onError,
    });
  }

  async deleteReview(onSuccess, onError, id, userId) {
    return await this.#httpRequest.delete({
      query: `/reviews/${id}${params({ userId })}`,
      onSuccess,
      onError,
    });
  }

  async getNotifications(onSuccess, onError, userId, query = {}) {
    return await this.#httpRequest.get({
      query: '/notifications' + params({ userId, ...query }),
      onSuccess,
      onError,
    });
  }

  async markNotificationAsRead(onSuccess, onError, id, userId) {
    return await this.#httpRequest.patch({
      query: `/notifications/${id}${params({ userId })}`,
      body: { isRead: true },
      onSuccess,
      onError,
    });
  }

  async deleteNotification(onSuccess, onError, id, userId) {
    return await this.#httpRequest.delete({
      query: `/notifications/${id}${params({ userId })}`,
      onSuccess,
      onError,
    });
  }

  async updateAvatar(onSuccess, onError, id, formData) {
    return await this.#httpRequest.patch({
      query: `/users/${id}/avatar`,
      body: formData,
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
