document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const produtoCards = document.querySelectorAll('.produto-card');
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');

    let carrinho = [];

    // Filtro de produtos
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filtro = this.getAttribute('data-filter');

            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Filtrar produtos
            produtoCards.forEach(card => {
                const categoria = card.getAttribute('data-categoria');

                if (filtro === 'todos' || categoria === filtro) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Botões de adicionar ao carrinho
    const btnAdds = document.querySelectorAll('.btn-add');
    
    btnAdds.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const card = this.closest('.produto-card');
            const nome = card.querySelector('h3').textContent;
            const preco = card.querySelector('.produto-preco').textContent;
            const precoNumero = parseFloat(preco.replace('R$ ', '').replace(',', '.'));
            
            // Verificar se o item já existe no carrinho
            const itemExistente = carrinho.find(item => item.nome === nome);
            
            if (itemExistente) {
                itemExistente.quantidade++;
            } else {
                carrinho.push({
                    nome: nome,
                    preco: precoNumero,
                    quantidade: 1,
                    preoFormatado: preco
                });
            }

            atualizarCarrinho();

            // Feedback visual
            this.textContent = '✓ Adicionado!';
            this.style.background = 'var(--coffee-dark)';
            
            setTimeout(() => {
                this.textContent = '+ Adicionar';
                this.style.background = 'var(--coffee)';
            }, 1500);
        });
    });

    function atualizarCarrinho() {
        // Limpar carrinho exibido
        cartItems.innerHTML = '';

        if (carrinho.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Nenhum item adicionado</div>';
            totalPrice.textContent = 'R$ 0,00';
            return;
        }

        let total = 0;

        carrinho.forEach((item, index) => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div>
                    <strong>${item.nome}</strong>
                    <small>Qty: ${item.quantidade}</small>
                </div>
                <div>
                    <div>R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
                    <button type="button" data-index="${index}">Remover</button>
                </div>
            `;

            cartItems.appendChild(itemElement);

            // Botão de remover
            itemElement.querySelector('button').addEventListener('click', function() {
                carrinho.splice(index, 1);
                atualizarCarrinho();
            });
        });

        totalPrice.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // Inicializar com carrinho vazio
    atualizarCarrinho();
});
