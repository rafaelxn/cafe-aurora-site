document.addEventListener('DOMContentLoaded', function() {
  carregarProdutos();
  setupFiltros();
  setupCarrinho();
});

function carregarProdutos() {
  const container = document.getElementById('produtosContainer');
  container.innerHTML = '';
  
  produtos.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'produto-card';
    card.setAttribute('data-categoria', produto.categoria);
    
    const precoFormatado = 'R$ ' + produto.preco.toFixed(2).replace('.', ',');
    
    card.innerHTML = `
      <div class="produto-imagem">
        <div style="font-size: 3rem;">${produto.imagem}</div>
        ${produto.destaque ? '<span class="produto-badge">Destaque</span>' : ''}
      </div>
      <div class="produto-info">
        <h3>${produto.nome}</h3>
        <p class="descricao">${produto.descricao}</p>
        <div class="produto-detalhes">
          <span class="preco">${precoFormatado}</span>
          <span class="tamanho">${produto.tamanho}</span>
        </div>
        <button class="btn-add" onclick="adicionarAoCarrinho('${produto.nome}', '${precoFormatado}', '${produto.tamanho}')">+ Adicionar</button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function setupFiltros() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filtro = this.getAttribute('data-filter');
      
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const cards = document.querySelectorAll('.produto-card');
      cards.forEach(card => {
        const categoria = card.getAttribute('data-categoria');
        
        if (filtro === 'todos' || categoria === filtro) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

function setupCarrinho() {
  const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');
  const btnConfirmarPagamento = document.getElementById('btnConfirmarPagamento');
  
  if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener('click', function() {
      const carrinhoModal = bootstrap.Modal.getInstance(document.getElementById('carrinhoModal'));
      if (carrinhoModal) carrinhoModal.hide();
      
      // Fechar o modal anterior
      setTimeout(() => {
        abrirFormularioPagamento();
      }, 300);
    });
  }
  
  if (btnConfirmarPagamento) {
    btnConfirmarPagamento.addEventListener('click', function() {
      if (validarFormulario()) {
        confirmarPagamento();
      }
    });
  }
}

function adicionarAoCarrinho(nome, preco, tamanho) {
  if (carrinhoGlobal) {
    carrinhoGlobal.adicionarItem(nome, preco, tamanho);
  }
}

function abrirFormularioPagamento() {
  // Atualizar resumo do pedido
  const resumoPedido = document.getElementById('resumoPedido');
  const totalPagamento = document.getElementById('totalPagamento');
  
  let html = '';
  carrinhoGlobal.itens.forEach(item => {
    html += `
      <div class="d-flex justify-content-between mb-2">
        <span>${item.nome} (${item.quantidade}x)</span>
        <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
      </div>
    `;
  });
  
  resumoPedido.innerHTML = html;
  const total = carrinhoGlobal.obterTotal();
  totalPagamento.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
  
  // Abrir modal de pagamento
  const modal = new bootstrap.Modal(document.getElementById('confirmacaoPagamentoModal'));
  modal.show();
}

function validarFormulario() {
  const nome = document.getElementById('nomeCliente').value.trim();
  const email = document.getElementById('emailCliente').value.trim();
  const telefone = document.getElementById('telefoneCliente').value.trim();
  const endereco = document.getElementById('enderecoCliente').value.trim();
  const cep = document.getElementById('cepCliente').value.trim();
  
  if (!nome || !email || !telefone || !endereco || !cep) {
    alert('Por favor, preencha todos os campos obrigatórios!');
    return false;
  }
  
  // Validação básica de email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    alert('Por favor, insira um email válido!');
    return false;
  }
  
  return true;
}

function confirmarPagamento() {
  const nome = document.getElementById('nomeCliente').value;
  const email = document.getElementById('emailCliente').value;
  const telefone = document.getElementById('telefoneCliente').value;
  const endereco = document.getElementById('enderecoCliente').value;
  const complemento = document.getElementById('complementoCliente').value;
  const cep = document.getElementById('cepCliente').value;
  const pagamento = document.querySelector('input[name="pagamento"]:checked').value;
  
  // Gerar número de pedido
  const numeroPedido = 'PED-' + Date.now();
  
  // Preparar dados do pedido
  const pedido = {
    numeroPedido,
    cliente: {
      nome,
      email,
      telefone,
      endereco,
      complemento,
      cep
    },
    itens: carrinhoGlobal.itens,
    total: carrinhoGlobal.obterTotal(),
    metodoPagamento: pagamento,
    data: new Date().toLocaleString('pt-BR')
  };
  
  // Salvar pedido no localStorage
  let pedidos = localStorage.getItem('pedidos-cafe');
  pedidos = pedidos ? JSON.parse(pedidos) : [];
  pedidos.push(pedido);
  localStorage.setItem('pedidos-cafe', JSON.stringify(pedidos));
  
  // Log do pedido (simulação de envio)
  console.log('Pedido confirmado:', pedido);
  
  // Fechar modal de pagamento
  const modalPagamento = bootstrap.Modal.getInstance(document.getElementById('confirmacaoPagamentoModal'));
  if (modalPagamento) modalPagamento.hide();
  
  // Mostrar modal de sucesso
  setTimeout(() => {
    document.getElementById('numPedido').textContent = numeroPedido;
    const modalSucesso = new bootstrap.Modal(document.getElementById('sucessoModal'));
    modalSucesso.show();
    
    // Limpar carrinho
    carrinhoGlobal.limpar();
    
    // Limpar formulário
    document.getElementById('nomeCliente').value = '';
    document.getElementById('emailCliente').value = '';
    document.getElementById('telefoneCliente').value = '';
    document.getElementById('enderecoCliente').value = '';
    document.getElementById('complementoCliente').value = '';
    document.getElementById('cepCliente').value = '';
  }, 300);
}

// Estilo para notificações
const style = document.createElement('style');
style.textContent = `
  .toast-notificacao {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--coffee);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: 600;
    animation: slideIn 0.3s ease;
    z-index: 9999;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
