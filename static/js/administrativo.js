document.addEventListener('DOMContentLoaded', async () => {
  const user = await userReady;
  if (!user || user.role !== 'ADMIN') return;

  const root = document.getElementById('adminPedidos');
  if (!root) return;

  const labels = {
    pendente: 'Pendente',
    em_atendimento: 'Em atendimento',
    finalizado: 'Finalizado'
  };
  let orders = [];
  let selectedStatus = 'pendente';

  function render() {
    document.querySelectorAll('.admin-tab').forEach(button => {
      const active = button.dataset.status === selectedStatus;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const filtered = orders.filter(order => order.status === selectedStatus);
    if (!filtered.length) {
      root.innerHTML = '<div class="empty-pedidos">Nenhum pedido nesta categoria.</div>';
      return;
    }

    root.innerHTML = filtered.map(order => {
      const nextLabel = selectedStatus === 'pendente'
        ? 'Iniciar atendimento'
        : 'Finalizar pedido';

      return `
        <article class="admin-card">
          <h3>Pedido #${order.id}</h3>
          <p>
            <span class="status-badge ${order.status}">
              ${labels[order.status] || escapeHtml(order.status)}
            </span>
          </p>
          <p><strong>Cliente:</strong> ${escapeHtml(order.clienteNome)}</p>
          <p><strong>Telefone:</strong> ${escapeHtml(order.telefone)}</p>
          <p><strong>Endereço:</strong> ${escapeHtml(order.endereco)}</p>
          <div class="admin-card-items">
            <strong>Itens:</strong>
            <ul class="list-unstyled mb-0 mt-2">
              ${order.itens.map(item => `
                <li>${item.quantidade}x ${escapeHtml(item.nome)}</li>
              `).join('')}
            </ul>
          </div>
          <p><strong>Total:</strong> ${money(order.total)}</p>
          ${selectedStatus === 'finalizado' ? '' : `
            <button class="btn btn-coffee" type="button" data-id="${order.id}">
              ${nextLabel}
            </button>
          `}
        </article>
      `;
    }).join('');
  }

  async function refresh() {
    root.innerHTML = '<div class="admin-notice">Carregando pedidos...</div>';
    try {
      orders = await Api.get('/api/admin/orders');
      render();
    } catch (error) {
      root.innerHTML = `
        <div class="admin-notice" role="alert">
          ${escapeHtml(error.message)}
        </div>
      `;
    }
  }

  document.querySelectorAll('.admin-tab').forEach(button => {
    button.addEventListener('click', () => {
      selectedStatus = button.dataset.status;
      render();
    });
  });

  root.addEventListener('click', async event => {
    const button = event.target.closest('button[data-id]');
    if (!button) return;

    button.disabled = true;
    const status = selectedStatus === 'pendente' ? 'em_atendimento' : 'finalizado';

    try {
      await Api.patch('/api/admin/orders/' + button.dataset.id + '/status', {
        status
      });
      await refresh();
    } catch (error) {
      announce(error.message);
      button.disabled = false;
    }
  });

  await refresh();
});
