class HttpRequest {
  #api_host;

  constructor() {
    this.#api_host = 'https://67dc4306e00db03c406778bd.mockapi.io/api';
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
      } else throw new Error(res.status);
    } catch (e) {
      console.log(e);
      if (onError) onError(e);
      if (e.message == '401') redirectPath = '/auth/login.html';
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

  async getEvents(onSuccess, onError, query = '') {
    return await this.#httpRequest.get({
      query: '/events' + query,
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
}
