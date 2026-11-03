document.addEventListener('DOMContentLoaded', async () => {
  const user = await userReady;
  if (!user || user.role !== 'ADMIN') return;

  const root = document.getElementById('adminPedidos');
  const labels = {
    pendente: 'Pendente',
    em_atendimento: 'Em atendimento',
    finalizado: 'Finalizado'
  };
  let orders = [];
  let status = 'pendente';

  function render() {
    document.querySelectorAll('.admin-tab').forEach(button => {
      button.classList.toggle('active', button.dataset.status === status);
    });

    const selected = orders.filter(order => order.status === status);
    root.innerHTML = selected.length
      ? selected.map(order => `
        <article class="admin-card">
          <h3>Pedido #${order.id}</h3>
          <p><strong>Cliente:</strong> ${escapeHtml(order.clienteNome)}</p>
          <p><strong>Telefone:</strong> ${escapeHtml(order.telefone)}</p>
          <p><strong>Endereço:</strong> ${escapeHtml(order.endereco)}</p>
          <p><strong>Status:</strong> ${labels[order.status]}</p>
          <p><strong>Itens:</strong> ${order.itens.map(
            item => `${item.quantidade}x ${escapeHtml(item.nome)}`
          ).join(', ')}</p>
          <p><strong>Total:</strong> ${money(order.total)}</p>
          ${status === 'finalizado' ? '' : `
            <button class="btn btn-coffee" data-id="${order.id}">
              ${status === 'pendente' ? 'Iniciar atendimento' : 'Finalizar'}
            </button>
          `}
        </article>
      `).join('')
      : '<p>Nenhum pedido nesta categoria.</p>';
  }

  async function refresh() {
    try {
      orders = await Api.get('/api/admin/orders');
      render();
    } catch (error) {
      root.textContent = error.message;
    }
  }

  document.querySelectorAll('.admin-tab').forEach(button => {
    button.addEventListener('click', () => {
      status = button.dataset.status;
      render();
    });
  });

  root.addEventListener('click', async event => {
    const button = event.target.closest('[data-id]');
    if (!button) return;

    button.disabled = true;
    try {
      const nextStatus = status === 'pendente' ? 'em_atendimento' : 'finalizado';
      await Api.patch('/api/admin/orders/' + button.dataset.id + '/status', {
        status: nextStatus
      });
      await refresh();
    } catch (error) {
      announce(error.message);
      button.disabled = false;
    }
  });

  await refresh();
});
