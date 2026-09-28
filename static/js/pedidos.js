const produtos = [
  { id: 1, categoria: 'bebidas', nome: 'Espresso Simples', descricao: 'Café coado na hora, intenso e encorpado.', preco: 7.9, tempo: '50ml', imagem: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80' },
  { id: 2, categoria: 'bebidas', nome: 'Cappuccino', descricao: 'Espresso com leite cremoso e chocolate.', preco: 9.9, tempo: '250ml', imagem: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80' },
  { id: 3, categoria: 'bebidas', nome: 'Latte Cremoso', descricao: 'Café suave com leite vaporizado.', preco: 8.9, tempo: '280ml', imagem: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80' },
  { id: 4, categoria: 'paes', nome: 'Croissant Manteiga', descricao: 'Folhado crocante com manteiga de qualidade premium.', preco: 6.9, tempo: '85g', imagem: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  { id: 5, categoria: 'paes', nome: 'Croissant de Chocolate', descricao: 'Folhado com chocolate belga derretendo.', preco: 8.9, tempo: '95g', imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80' },
  { id: 6, categoria: 'paes', nome: 'Pão de Queijo', descricao: 'Quentinho e crocante, feito diariamente.', preco: 7.9, tempo: '75g', imagem: 'https://images.unsplash.com/photo-1549931314-a545dcf3bc73?auto=format&fit=crop&w=800&q=80' },
  { id: 7, categoria: 'doces', nome: 'Tiramisú', descricao: 'Clássico italiano com mascarpone e café.', preco: 14.9, tempo: 'Fatia', imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80' },
  { id: 8, categoria: 'doces', nome: 'Cheesecake', descricao: 'Base de biscoito com cream cheese cremoso.', preco: 12.9, tempo: 'Fatia', imagem: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80' },
  { id: 9, categoria: 'doces', nome: 'Bolo de Chocolate', descricao: 'Dois andares de chocolate derretendo.', preco: 13.9, tempo: 'Fatia', imagem: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80' },
  { id: 10, categoria: 'salgados', nome: 'Sanduíche Vegano', descricao: 'Pão artesanal com hummus, alface e tomate.', preco: 9.9, tempo: '250g', imagem: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80' },
  { id: 11, categoria: 'salgados', nome: 'Sanduíche Club', descricao: 'Peito de peru, queijo, bacon e abacate.', preco: 12.9, tempo: '300g', imagem: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=80' },
  { id: 12, categoria: 'salgados', nome: 'Quiche Lorraine', descricao: 'Massa folhada com ovos, bacon e creme.', preco: 10.9, tempo: 'Fatia', imagem: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80' }
];

let carrinho = JSON.parse(localStorage.getItem('cafe_aurora_carrinho')) || [];

const renderProdutos = (filter = 'all') => {
  const grid = document.getElementById('produtosGrid');
  if (!grid) return;

  const filtered = filter === 'all' ? produtos : produtos.filter((p) => p.categoria === filter);

  grid.innerHTML = filtered.map((produto) => `
    <article class="produto-card" data-id="${produto.id}">
      <img class="produto-img" src="${produto.imagem}" alt="${produto.nome}" />
      <div class="produto-top">
        <span>${produto.categoria}</span>
        <span class="produto-preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
      </div>
      <h3>${produto.nome}</h3>
      <p>${produto.descricao}</p>
      <div class="produto-actions">
        <span class="produto-qt">${produto.tempo}</span>
        <button class="btn-add" data-id="${produto.id}">Adicionar</button>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.btn-add').forEach((btn) => {
    btn.addEventListener('click', function () {
      const id = Number(this.dataset.id);
      const produto = produtos.find((item) => item.id === id);
      addToCarrinho(produto);
    });
  });
};

const addToCarrinho = (produto) => {
  const itemExistente = carrinho.find((p) => p.id === produto.id);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({ ...produto, quantidade: 1 });
  }
  localStorage.setItem('cafe_aurora_carrinho', JSON.stringify(carrinho));
  renderCarrinho();
};

const removerItemCarrinho = (id) => {
  carrinho = carrinho.filter((item) => item.id !== id);
  localStorage.setItem('cafe_aurora_carrinho', JSON.stringify(carrinho));
  renderCarrinho();
};

const renderCarrinho = () => {
  const cartItems = document.getElementById('cart-items');
  const subTotalEl = document.getElementById('subTotal');
  if (!cartItems || !subTotalEl) return;

  if (!carrinho.length) {
    cartItems.innerHTML = '<div class="empty-cart">Seu carrinho está vazio.</div>';
    subTotalEl.textContent = 'R$ 0,00';
    return;
  }

  cartItems.innerHTML = carrinho.map((item) => `
    <div class="cart-item">
      <div>
        <strong>${item.nome}</strong><br>
        <small>${item.quantidade}x • R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</small>
      </div>
      <button data-remove-id="${item.id}">Remover</button>
    </div>
  `).join('');

  document.querySelectorAll('[data-remove-id]').forEach((btn) => {
    btn.addEventListener('click', function () {
      removerItemCarrinho(Number(this.dataset.removeId));
    });
  });

  const subtotal = carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);
  subTotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
};

const setupFilters = () => {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
      this.classList.add('active');
      renderProdutos(this.dataset.filter);
    });
  });
};

const toggleAtendimentoFields = () => {
  const tipo = document.getElementById('tipoAtendimento');
  const campoMesa = document.getElementById('campoMesa');
  const campoEntrega = document.getElementById('campoEntrega');

  if (!tipo) return;

  tipo.addEventListener('change', function () {
    campoMesa.style.display = this.value === 'mesa' ? 'block' : 'none';
    campoEntrega.style.display = this.value === 'entrega' ? 'block' : 'none';
  });
};

const finalizarPedido = () => {
  const button = document.getElementById('btnFinalizarPedido');
  if (!button) return;

  button.addEventListener('click', function () {
    const user = currentUser();
    if (!user) {
      alert('Você precisa realizar login antes de fazer um pedido.');
      window.location.href = 'login.html';
      return;
    }

    if (!carrinho.length) {
      alert('Seu carrinho está vazio.');
      return;
    }

    const tipo = document.getElementById('tipoAtendimento').value;
    const mesa = document.getElementById('numeroMesa')?.value || null;
    const endereco = document.getElementById('enderecoEntrega')?.value || '';
    const observacoes = document.getElementById('observacoes').value.trim();

    if (tipo === 'mesa' && !mesa) {
      alert('Selecione a mesa.');
      return;
    }

    if (tipo === 'entrega' && !endereco.trim()) {
      alert('Informe o endereço para entrega.');
      return;
    }

    const pedidos = JSON.parse(localStorage.getItem('cafe_aurora_pedidos')) || [];
    const novoPedido = {
      id: Date.now(),
      clienteNome: user.nome,
      clienteEmail: user.email,
      tipoAtendimento: tipo,
      mesa: tipo === 'mesa' ? Number(mesa) : null,
      enderecoEntrega: tipo === 'entrega' ? endereco : '',
      observacoes,
      status: 'pendente',
      data: new Date().toISOString(),
      itens: carrinho.map((item) => ({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco
      })),
      total: carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0)
    };

    pedidos.push(novoPedido);
    localStorage.setItem('cafe_aurora_pedidos', JSON.stringify(pedidos));
    carrinho = [];
    localStorage.setItem('cafe_aurora_carrinho', JSON.stringify(carrinho));
    renderCarrinho();
    alert('Pedido realizado com sucesso!');
    window.location.href = 'pedidos.html';
  });
};

document.addEventListener('DOMContentLoaded', function () {
  renderProdutos();
  renderCarrinho();
  setupFilters();
  toggleAtendimentoFields();
  finalizarPedido();
});
