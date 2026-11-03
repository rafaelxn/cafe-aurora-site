/**
 * Modo de demonstração EXCLUSIVAMENTE para GitHub Pages e arquivos locais.
 * Não faz autenticação de verdade, não envia pedidos e não processa pagamentos.
 * Nunca armazena senhas. A versão Spring Boot usa a API real.
 */
(() => {
  'use strict';

  const enabled = location.hostname.endsWith('.github.io') || location.protocol === 'file:';
  const PREFIX = 'cafe-aurora-demo-v1:';
  const KEYS = {
    users: PREFIX + 'usuarios',
    orders: PREFIX + 'pedidos',
    session: PREFIX + 'sessao'
  };

  function read(storage, key, fallback) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      throw new Error('Armazenamento do navegador indisponível para a demonstração.');
    }
  }

  function bad(message) {
    throw new Error(message);
  }

  function session() {
    return read(sessionStorage, KEYS.session, null);
  }

  function requireSession() {
    const user = session();
    if (!user) bad('Faça login para visualizar seus pedidos.');
    return user;
  }

  function requireAdmin() {
    const user = requireSession();
    if (user.role !== 'ADMIN') bad('Área exclusiva da conta de demonstração administrativa.');
    return user;
  }

  function demoProducts() {
    return typeof produtos !== 'undefined' && Array.isArray(produtos) ? produtos : [];
  }

  function register(body) {
    const email = String(body?.email || '').trim().toLowerCase();
    const name = String(body?.nome || '').trim();
    const password = String(body?.senha || '');
    const users = read(localStorage, KEYS.users, []);

    if (!name || !email.includes('@') || password.length < 8) {
      bad('Informe nome, e-mail e uma senha com pelo menos 8 caracteres.');
    }
    if (email === 'admin@demo.local' || users.some(user => user.email === email)) {
      bad('E-mail já cadastrado nesta demonstração.');
    }

    const user = {
      id: users.length + 1,
      nome: name,
      email,
      telefone: String(body.telefone || '').trim(),
      role: 'CLIENTE'
    };

    // Sem campo "senha": o formulário é uma simulação visual, não uma conta real.
    users.push(user);
    write(localStorage, KEYS.users, users);
    return user;
  }

  function login(body) {
    const email = String(body?.email || '').trim().toLowerCase();
    if (!String(body?.senha || '')) bad('Informe a senha no formulário.');

    const user = email === 'admin@demo.local'
      ? { id: 0, nome: 'Administrador Demo', email, telefone: '', role: 'ADMIN' }
      : read(localStorage, KEYS.users, []).find(record => record.email === email);

    if (!user) bad('Conta de demonstração não encontrada. Faça um cadastro de teste.');
    // Senhas NÃO são verificadas neste modo. Nunca utilize-o para usuários reais.
    write(sessionStorage, KEYS.session, user);
    return user;
  }

  function createOrder(body) {
    const user = requireSession();
    const products = demoProducts();
    const items = Array.isArray(body?.itens) ? body.itens : [];
    if (!items.length || items.length > 30 || !products.length) {
      bad('Seu carrinho está vazio ou o cardápio está indisponível.');
    }

    for (const field of ['nome', 'email', 'telefone', 'endereco', 'cep', 'pagamento']) {
      if (!String(body[field] || '').trim()) bad('Preencha os dados obrigatórios.');
    }

    const allowedPayments = ['pix', 'cartao', 'dinheiro'];
    if (!allowedPayments.includes(body.pagamento)) bad('Forma de pagamento inválida.');

    const unique = new Set();
    const details = items.map(item => {
      const product = products.find(entry => entry.id === Number(item.produtoId));
      const quantity = Number(item.quantidade);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99 ||
          unique.has(product.id)) {
        bad('Produto ou quantidade inválida.');
      }
      unique.add(product.id);
      return {
        nome: product.nome,
        quantidade: quantity,
        preco: product.preco
      };
    });

    const orders = read(localStorage, KEYS.orders, []);
    const id = orders.reduce((largest, order) => Math.max(largest, Number(order.id) || 0), 0) + 1;
    const totalCents = details.reduce((sum, item) =>
      sum + Math.round(item.preco * 100) * item.quantidade, 0);
    const order = {
      id,
      numeroPedido: 'DEMO-' + id,
      clienteNome: String(body.nome).trim(),
      clienteEmail: user.email,
      telefone: String(body.telefone).trim(),
      endereco: String(body.endereco).trim(),
      complemento: String(body.complemento || '').trim(),
      cep: String(body.cep).trim(),
      pagamento: body.pagamento,
      status: 'pendente',
      data: new Date().toISOString(),
      itens: details,
      total: totalCents / 100
    };

    orders.unshift(order);
    write(localStorage, KEYS.orders, orders);
    return order;
  }

  function updateOrder(url, body) {
    requireAdmin();
    const id = Number(url.split('/')[4]);
    const next = String(body?.status || '').toLowerCase();
    const orders = read(localStorage, KEYS.orders, []);
    const order = orders.find(entry => entry.id === id);

    if (!order) bad('Pedido de demonstração não encontrado.');
    const allowed =
      (order.status === 'pendente' && next === 'em_atendimento') ||
      (order.status === 'em_atendimento' && next === 'finalizado');
    if (!allowed) bad('Transição de status não permitida.');
    order.status = next;
    write(localStorage, KEYS.orders, orders);
    return order;
  }

  async function request(url, method = 'GET', body) {
    if (method === 'GET' && url === '/api/products') return demoProducts();
    if (method === 'GET' && url === '/api/auth/me') return requireSession();
    if (method === 'POST' && url === '/api/auth/register') return register(body);
    if (method === 'POST' && url === '/api/auth/login') return login(body);
    if (method === 'POST' && url === '/api/auth/logout') {
      sessionStorage.removeItem(KEYS.session);
      return null;
    }
    if (method === 'GET' && url === '/api/orders') {
      const user = requireSession();
      return read(localStorage, KEYS.orders, []).filter(order => order.clienteEmail === user.email);
    }
    if (method === 'POST' && url === '/api/orders') return createOrder(body);
    if (method === 'GET' && url === '/api/admin/orders') {
      requireAdmin();
      return read(localStorage, KEYS.orders, []);
    }
    if (method === 'PATCH' && /^\/api\/admin\/orders\/\d+\/status$/.test(url)) {
      return updateOrder(url, body);
    }
    bad('Recurso indisponível no modo de demonstração.');
  }

  window.CafeDemo = { enabled, request };

  if (enabled) {
    document.addEventListener('DOMContentLoaded', () => {
      const banner = document.createElement('aside');
      banner.className = 'demo-banner';
      banner.setAttribute('role', 'status');
      banner.textContent = 'DEMONSTRAÇÃO LOCAL — sem pedidos ou pagamentos reais. Senhas não são verificadas nem armazenadas. Admin de teste: admin@demo.local (qualquer senha).';
      document.body.prepend(banner);

      const successHeading = document.querySelector('#sucessoModal h5');
      if (successHeading) successHeading.textContent = 'Pedido de demonstração salvo!';
      const successMessage = document.querySelector('#sucessoModal .text-muted');
      if (successMessage) {
        successMessage.textContent = 'Este pedido existe apenas neste navegador e não foi enviado à cafeteria.';
      }
    });
  }
})();
