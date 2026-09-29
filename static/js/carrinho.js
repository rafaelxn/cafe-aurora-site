class Carrinho {
  constructor() {
    this.itens = [];
    this.carregarDados();
    this.atualizarBadge();
  }

  adicionarItem(nome, preco, tamanho) {
    const precoNum = parseFloat(preco.toString().replace('R$', '').replace(',', '.'));
    
    const itemExistente = this.itens.find(item => item.nome === nome);
    
    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.itens.push({
        nome,
        preco: precoNum,
        tamanho,
        quantidade: 1
      });
    }
    
    this.salvarDados();
    this.atualizarBadge();
    this.mostrarNotificacao(`${nome} adicionado ao carrinho!`);
  }

  removerItem(index) {
    this.itens.splice(index, 1);
    this.salvarDados();
    this.atualizarBadge();
  }

  alterarQuantidade(index, quantidade) {
    if (quantidade > 0) {
      this.itens[index].quantidade = quantidade;
      this.salvarDados();
      this.atualizarBadge();
    }
  }

  obterTotal() {
    return this.itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  }

  obterQuantidadeTotal() {
    return this.itens.reduce((total, item) => total + item.quantidade, 0);
  }

  limpar() {
    this.itens = [];
    this.salvarDados();
    this.atualizarBadge();
  }

  salvarDados() {
    localStorage.setItem('carrinho-cafe', JSON.stringify(this.itens));
  }

  carregarDados() {
    const dados = localStorage.getItem('carrinho-cafe');
    if (dados) {
      this.itens = JSON.parse(dados);
    }
  }

  atualizarBadge() {
    const badge = document.getElementById('cartBadge');
    const quantidade = this.obterQuantidadeTotal();
    
    if (badge) {
      if (quantidade > 0) {
        badge.textContent = quantidade;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  mostrarNotificacao(mensagem) {
    // Toast simplificado
    const toast = document.createElement('div');
    toast.className = 'toast-notificacao';
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }
}

// Instância global do carrinho
let carrinhoGlobal;

document.addEventListener('DOMContentLoaded', function() {
  carrinhoGlobal = new Carrinho();
  
  // Botão do carrinho
  const btnCarrinho = document.getElementById('btnCarrinho');
  if (btnCarrinho) {
    btnCarrinho.addEventListener('click', function() {
      mostrarCarrinho();
    });
  }
});

function mostrarCarrinho() {
  const conteudo = document.getElementById('carrinhoConteudo');
  const totalCarrinho = document.getElementById('totalCarrinho');
  const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');
  
  if (carrinhoGlobal.itens.length === 0) {
    conteudo.innerHTML = '<div class="carrinho-vazio"><i class="fas fa-shopping-cart"></i><p class="text-muted mt-3">Seu carrinho está vazio</p></div>';
    btnFinalizarCompra.disabled = true;
  } else {
    let html = '';
    carrinhoGlobal.itens.forEach((item, index) => {
      html += `
        <div class="carrinho-item">
          <div class="item-info">
            <div class="item-nome">${item.nome}</div>
            <div class="item-preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
            <div class="text-muted" style="font-size: 0.85rem;">${item.tamanho}</div>
          </div>
          <div class="item-quantidade">
            <button onclick="carrinhoGlobal.alterarQuantidade(${index}, ${item.quantidade - 1}); mostrarCarrinho();">−</button>
            <span>${item.quantidade}</span>
            <button onclick="carrinhoGlobal.alterarQuantidade(${index}, ${item.quantidade + 1}); mostrarCarrinho();">+</button>
          </div>
          <div>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</div>
          <button class="btn-remover" onclick="carrinhoGlobal.removerItem(${index}); mostrarCarrinho();">×</button>
        </div>
      `;
    });
    conteudo.innerHTML = html;
    totalCarrinho.textContent = 'R$ ' + carrinhoGlobal.obterTotal().toFixed(2).replace('.', ',');
    btnFinalizarCompra.disabled = false;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('carrinhoModal'));
  modal.show();
}

window.mostrarCarrinho = mostrarCarrinho;
