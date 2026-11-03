document.addEventListener('DOMContentLoaded', async () => {
  const user = await userReady;
  if (!user) return;

  document.getElementById('clienteNome').textContent = user.nome.split(' ')[0];
  const container = document.getElementById('listaPedidos');
  const statuses = {
    pendente: 'Pendente',
    em_atendimento: 'Em atendimento',
    finalizado: 'Finalizado'
  };

  try {
    const orders = await Api.get('/api/orders');
    if (!orders.length) {
      container.innerHTML =
        '<p>Nenhum pedido realizado. <a href="produtos.html">Ver cardápio</a></p>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <article class="card mb-3">
        <div class="card-body">
          <h3 class="h5">Pedido #${order.id}</h3>
          <p><strong>Status:</strong> ${statuses[order.status] || escapeHtml(order.status)}</p>
          <p><strong>Data:</strong> ${new Date(order.data).toLocaleString('pt-BR')}</p>
          <p><strong>Itens:</strong>
            ${order.itens.map(item => `${escapeHtml(item.nome)} (${item.quantidade}x)`).join(', ')}
          </p>
          <p><strong>Total:</strong> ${money(order.total)}</p>
        </div>
      </article>
    `).join('');
  } catch (error) {
    container.textContent = error.message;
  }
});
