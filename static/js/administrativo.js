const statusLabels = {
  pendente: 'Pendente',
  em_atendimento: 'Em atendimento',
  finalizado: 'Finalizado'
};

function renderAdminPedidos(status = 'em_atendimento') {
  if (redirectIfNotAdmin()) return;

  const pedidos = JSON.parse(localStorage.getItem('cafe_aurora_pedidos')) || [];
  const container = document.getElementById('adminPedidos');

  const filtrados = pedidos.filter((pedido) => pedido.status === status);
  if (!container) return;

  if (!filtrados.length) {
    container.innerHTML = '<div class="empty-pedidos"><h3>Nenhum pedido nesta categoria.</h3></div>';
    return;
  }

  container.innerHTML = filtrados.map((pedido) => `
    <article class="admin-card">
      <h3>Pedido #${pedido.id}</h3>
      <p><strong>Cliente:</strong> ${pedido.clienteNome}</p>
      <p><strong>Atendimento:</strong> ${pedido.tipoAtendimento}</p>
      <p><strong>Status:</strong> ${statusLabels[pedido.status]}</p>
      <p><strong>Itens:</strong> ${pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}</p>
      <p><strong>Total:</strong> R$ ${pedido.total.toFixed(2).replace('.', ',')}</p>
      ${status === 'em_atendimento' ? '<button class="btn btn-coffee" data-finalizar="'+pedido.id+'">Finalizar</button>' : ''}
    </article>
  `).join('');

  document.querySelectorAll('[data-finalizar]').forEach((btn) => {
    btn.addEventListener('click', function () {
      const id = Number(this.dataset.finalizar);
      const pedidosData = JSON.parse(localStorage.getItem('cafe_aurora_pedidos')) || [];
      const updated = pedidosData.map((pedido) => {
        if (pedido.id === id) pedido.status = 'finalizado';
        return pedido;
      });
      localStorage.setItem('cafe_aurora_pedidos', JSON.stringify(updated));
      renderAdminPedidos('em_atendimento');
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  if (redirectIfNotAdmin()) return;

  renderAdminPedidos('em_atendimento');

  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.admin-tab').forEach((item) => item.classList.remove('active'));
      this.classList.add('active');
      renderAdminPedidos(this.dataset.status);
    });
  });
});
