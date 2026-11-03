const Api = {
  async request(url, method = 'GET', body) {
    // GitHub Pages hospeda somente arquivos estáticos; usa dados locais de demonstração.
    if (window.CafeDemo?.enabled) {
      return window.CafeDemo.request(url, method, body);
    }

    const headers = { Accept: 'application/json' };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (!['GET', 'HEAD'].includes(method)) {
      const response = await fetch('/api/auth/csrf', { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error('Não foi possível iniciar uma solicitação segura.');
      }
      const csrf = await response.json();
      headers['X-XSRF-TOKEN'] = csrf.token;
    }

    let response;
    try {
      response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch {
      throw new Error('Servidor indisponível. Verifique a conexão com a API.');
    }

    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.detail || ('Erro HTTP ' + response.status));
    }
    return data;
  },

  get(url) {
    return this.request(url);
  },

  post(url, body) {
    return this.request(url, 'POST', body);
  },

  patch(url, body) {
    return this.request(url, 'PATCH', body);
  },

  logout() {
    return this.request('/api/auth/logout', 'POST');
  }
};

function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}

function money(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function announce(message) {
  alert(message);
}
