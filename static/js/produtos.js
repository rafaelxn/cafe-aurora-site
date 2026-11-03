let catalog = [];

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('produtosContainer');
  if (!container) return;

  const element = id => document.getElementById(id);

  function renderProducts(filter = 'todos') {
    const filtered = filter === 'todos'
      ? catalog
      : catalog.filter(product => product.categoria === filter);

    container.innerHTML = filtered.map(product => `
      <article class="produto-card" data-categoria="${escapeHtml(product.categoria)}">
        <div class="produto-imagem">
          <div style="font-size: 3rem">${escapeHtml(product.imagem)}</div>
          ${product.destaque ? '<span class="produto-badge">Destaque</span>' : ''}
        </div>
        <div class="produto-info">
          <h3>${escapeHtml(product.nome)}</h3>
          <p class="descricao">${escapeHtml(product.descricao)}</p>
          <div class="produto-detalhes">
            <span class="preco">${money(product.preco)}</span>
            <span class="tamanho">${escapeHtml(product.tamanho)}</span>
          </div>
          <button class="btn-add" data-product="${product.id}">
            + Adicionar
          </button>
        </div>
      </article>
    `).join('');
  }

  try {
    catalog = await Api.get('/api/products');
    renderProducts();
  } catch (error) {
    container.textContent = 'Não foi possível carregar o cardápio: ' + error.message;
  }

  container.addEventListener('click', event => {
    const button = event.target.closest('[data-product]');
    if (!button) return;

    const product = catalog.find(item => item.id === Number(button.dataset.product));
    if (!product) return;

    carrinhoGlobal.add(product);
    button.textContent = '✓ Adicionado!';
    setTimeout(() => {
      if (button.isConnected) button.textContent = '+ Adicionar';
    }, 1000);
  });

  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(tab => {
        tab.classList.toggle('active', tab === button);
      });
      renderProducts(button.dataset.filter);
    });
  });

  element('btnFinalizarCompra')?.addEventListener('click', async () => {
    const user = await userReady;
    if (!user) {
      location.assign('login.html');
      return;
    }
    if (!carrinhoGlobal.itens.length) return;

    element('nomeCliente').value = user.nome;
    element('emailCliente').value = user.email;
    element('telefoneCliente').value = user.telefone || '';

    element('resumoPedido').innerHTML = carrinhoGlobal.itens.map(item => `
      <div>${escapeHtml(item.nome)} (${item.quantidade}x) — ${money(item.preco * item.quantidade)}</div>
    `).join('');
    element('totalPagamento').textContent = money(carrinhoGlobal.total());

    const cartModal = element('carrinhoModal');
    const paymentModal = element('confirmacaoPagamentoModal');
    // Bootstrap não permite dois modais visíveis ao mesmo tempo.
    cartModal.addEventListener('hidden.bs.modal', () => {
      bootstrap.Modal.getOrCreateInstance(paymentModal).show();
    }, { once: true });
    bootstrap.Modal.getOrCreateInstance(cartModal).hide();
  });

  element('btnConfirmarPagamento')?.addEventListener('click', async () => {
    if (!carrinhoGlobal.itens.length) return;

    const payload = {
      nome: element('nomeCliente').value.trim(),
      email: element('emailCliente').value.trim(),
      telefone: element('telefoneCliente').value.trim(),
      endereco: element('enderecoCliente').value.trim(),
      complemento: element('complementoCliente').value.trim(),
      cep: element('cepCliente').value.trim(),
      pagamento: document.querySelector('input[name="pagamento"]:checked')?.value,
      itens: carrinhoGlobal.itens.map(item => ({
        produtoId: item.id,
        quantidade: item.quantidade
      }))
    };

    if (!payload.nome || !payload.email || !payload.telefone ||
        !payload.endereco || !payload.cep || !payload.pagamento) {
      announce('Preencha os dados obrigatórios.');
      return;
    }

    const button = element('btnConfirmarPagamento');
    button.disabled = true;
    try {
      const order = await Api.post('/api/orders', payload);
      carrinhoGlobal.clear();
      element('numPedido').textContent = order.numeroPedido;

      const paymentModal = element('confirmacaoPagamentoModal');
      paymentModal.addEventListener('hidden.bs.modal', () => {
        bootstrap.Modal.getOrCreateInstance(element('sucessoModal')).show();
      }, { once: true });
      bootstrap.Modal.getOrCreateInstance(paymentModal).hide();
    } catch (error) {
      announce(error.message);
    } finally {
      button.disabled = false;
    }
  });
});
