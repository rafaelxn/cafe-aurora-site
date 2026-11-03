class Carrinho {
  constructor() {
    try {
      this.itens = JSON.parse(localStorage.getItem('carrinho-cafe')) || [];
    } catch {
      this.itens = [];
    }

    if (!Array.isArray(this.itens)) this.itens = [];
    this.itens = this.itens.filter(item =>
      Number.isSafeInteger(item?.id) &&
      item.id > 0 &&
      Number.isSafeInteger(item.quantidade) &&
      item.quantidade >= 1 &&
      item.quantidade <= 99 &&
      Number.isFinite(item.preco) &&
      item.preco >= 0
    );
    this.update();
  }

  add(product) {
    const existing = this.itens.find(item => item.id === product.id);
    if (existing) {
      existing.quantidade = Math.min(99, existing.quantidade + 1);
    } else {
      this.itens.push({
        id: product.id,
        nome: product.nome,
        preco: Number(product.preco),
        tamanho: product.tamanho,
        quantidade: 1
      });
    }
    this.update();
  }

  remove(id) {
    this.itens = this.itens.filter(item => item.id !== id);
    this.update();
  }

  change(id, delta) {
    const item = this.itens.find(entry => entry.id === id);
    if (!item) return;

    item.quantidade = Math.min(99, item.quantidade + delta);
    if (item.quantidade <= 0) {
      this.remove(id);
    } else {
      this.update();
    }
  }

  clear() {
    this.itens = [];
    this.update();
  }

  total() {
    return this.itens.reduce((sum, item) =>
      sum + item.preco * item.quantidade, 0);
  }

  update() {
    try {
      localStorage.setItem('carrinho-cafe', JSON.stringify(this.itens));
    } catch {
      // Se o navegador não permitir armazenamento, o carrinho ainda funciona nesta aba.
    }

    const badge = document.getElementById('cartBadge');
    if (badge) {
      const count = this.itens.reduce((sum, item) => sum + item.quantidade, 0);
      badge.textContent = count;
      badge.style.display = count ? 'block' : 'none';
    }
  }

  render() {
    const target = document.getElementById('carrinhoConteudo');
    const total = document.getElementById('totalCarrinho');
    const button = document.getElementById('btnFinalizarCompra');
    if (!target || !total || !button) return;

    target.innerHTML = this.itens.length
      ? this.itens.map(item => `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div>
            <strong>${escapeHtml(item.nome)}</strong>
            <div>${money(item.preco)} × ${item.quantidade}</div>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-secondary"
                    data-step="-1" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
            ${item.quantidade}
            <button class="btn btn-sm btn-outline-secondary"
                    data-step="1" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
            <button class="btn btn-sm btn-outline-danger" data-remove="${item.id}">Remover</button>
          </div>
        </div>
      `).join('')
      : '<p>Seu carrinho está vazio.</p>';

    total.textContent = money(this.total());
    button.disabled = !this.itens.length;
  }
}

let carrinhoGlobal;

document.addEventListener('DOMContentLoaded', () => {
  carrinhoGlobal = new Carrinho();

  document.getElementById('btnCarrinho')?.addEventListener('click', () => {
    carrinhoGlobal.render();
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('carrinhoModal')
    ).show();
  });

  document.getElementById('carrinhoConteudo')?.addEventListener('click', event => {
    const change = event.target.closest('[data-step]');
    const remove = event.target.closest('[data-remove]');

    if (change) {
      carrinhoGlobal.change(Number(change.dataset.id), Number(change.dataset.step));
    }
    if (remove) {
      carrinhoGlobal.remove(Number(remove.dataset.remove));
    }

    carrinhoGlobal.render();
  });
});
