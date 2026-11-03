const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function browser(hostname = 'rafaelxn.github.io') {
  const state = new Map();
  const session = new Map();
  const storage = map => ({
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: key => map.delete(key)
  });

  const context = {
    location: { hostname, protocol: 'https:' },
    document: { addEventListener() {} },
    localStorage: storage(state),
    sessionStorage: storage(session),
    window: {}
  };

  vm.createContext(context);
  vm.runInContext(fs.readFileSync('static/js/produtos-dados.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('static/js/demo-api.js', 'utf8'), context);

  return { api: context.window.CafeDemo, state, session };
}

test('GitHub Pages shows the original twenty menu items', async () => {
  const { api } = browser();
  assert.equal(api.enabled, true);
  const products = await api.request('/api/products');
  assert.equal(products.length, 20);
  assert.equal(products[0].nome, 'Café Expresso');
});

test('demo account, order and admin flow work without storing passwords', async () => {
  const { api, state } = browser();
  const password = 'senha-demo-12345';
  await api.request('/api/auth/register', 'POST', {
    nome: 'Cliente Teste',
    email: 'teste@exemplo.local',
    senha: password,
    telefone: '11999999999'
  });
  assert.equal(JSON.stringify([...state.values()]).includes(password), false);

  const user = await api.request('/api/auth/login', 'POST', {
    email: 'teste@exemplo.local',
    senha: password
  });
  assert.equal(user.role, 'CLIENTE');

  const order = await api.request('/api/orders', 'POST', {
    nome: user.nome,
    email: user.email,
    telefone: '11999999999',
    endereco: 'Rua Teste 1',
    cep: '01000000',
    pagamento: 'pix',
    itens: [{ produtoId: 1, quantidade: 2 }]
  });
  assert.equal(order.total, 13);
  assert.equal(order.status, 'pendente');
  assert.match(order.numeroPedido, /^DEMO-/);

  const myOrders = await api.request('/api/orders');
  assert.equal(myOrders.length, 1);
  assert.equal(myOrders[0].id, order.id);

  await assert.rejects(api.request('/api/admin/orders'), /exclusiva/);
  await api.request('/api/auth/logout', 'POST');
  await assert.rejects(api.request('/api/orders'), /Faça login/);

  await api.request('/api/auth/login', 'POST', {
    email: 'admin@demo.local',
    senha: 'qualquer senha'
  });
  const allOrders = await api.request('/api/admin/orders');
  assert.equal(allOrders.length, 1);

  const updated = await api.request('/api/admin/orders/' + order.id + '/status',
    'PATCH', { status: 'em_atendimento' });
  assert.equal(updated.status, 'em_atendimento');

  await assert.rejects(api.request('/api/admin/orders/' + order.id + '/status',
    'PATCH', { status: 'em_atendimento' }), /Transição/);

  const finished = await api.request('/api/admin/orders/' + order.id + '/status',
    'PATCH', { status: 'finalizado' });
  assert.equal(finished.status, 'finalizado');
});

test('demo adapter never activates on the Spring Boot host', () => {
  const { api } = browser('localhost');
  assert.equal(api.enabled, false);
});

test('all HTML pages include the demo adapter after api.js', () => {
  const names = ['index', 'sobre', 'produtos', 'login', 'registro', 'pedidos', 'administrativo'];

  for (const name of names) {
    const html = fs.readFileSync(name + '.html', 'utf8');
    const apiIndex = html.indexOf('static/js/api.js');
    const demoIndex = html.indexOf('static/js/demo-api.js');
    assert.ok(apiIndex >= 0 && demoIndex > apiIndex, name + ': script order');
    if (name === 'produtos') {
      assert.ok(html.indexOf('static/js/produtos-dados.js') < demoIndex);
      assert.ok(html.indexOf('static/js/auth.js') > demoIndex);
    }
  }
});
