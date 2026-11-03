document.addEventListener('DOMContentLoaded', async () => {
  const user = await userReady;
  if (!user) return;

  const greeting = document.getElementById('clienteNome');
  if (greeting) greeting.textContent = user.nome.split(' ')[0];

  const container = document.getElementById('listaPedidos');
  if (!container) return;

  const statuses = {
    pendente: 'Pendente',
    em_atendimento: 'Em atendimento',
    finalizado: 'Finalizado'
  };

  container.innerHTML = '<div class="empty-pedidos">Carregando seus pedidos...</div>';

  try {
    const orders = await Api.get('/api/orders');
    if (!orders.length) {
      container.innerHTML = `
        <div class="empty-pedidos">
          Você ainda não fez pedidos.
          <a href="produtos.html">Conheça nosso cardápio.</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <article class="pedido-card">
        <div class="pedido-top">
          <h3>Pedido #${order.id}</h3>
          <span class="status-badge ${order.status}">
            ${statuses[order.status] || escapeHtml(order.status)}
          </span>
        </div>

        <div class="pedido-meta">
          <span>Feito em ${new Date(order.data).toLocaleString('pt-BR')}</span>
          <span>${order.itens.length} tipo(s) de produto</span>
        </div>

        <ul class="pedido-produtos">
          ${order.itens.map(item => `
            <li>
              <span>${item.quantidade}x ${escapeHtml(item.nome)}</span>
              <span>${money(item.preco * item.quantidade)}</span>
            </li>
          `).join('')}
        </ul>

        <div class="pedido-total">Total: ${money(order.total)}</div>
      </article>
    `).join('');
  } catch (error) {
    container.innerHTML = `
      <div class="empty-pedidos" role="alert">
        Não foi possível carregar seus pedidos: ${escapeHtml(error.message)}
      </div>
    `;
  }
});
