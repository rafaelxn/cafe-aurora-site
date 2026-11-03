let catalog=[];
document.addEventListener('DOMContentLoaded',async()=>{
 const container=document.getElementById('produtosContainer');
 const form=id=>document.getElementById(id);
 const render=(filter='todos')=>{
  const list=filter==='todos'?catalog:catalog.filter(p=>p.categoria===filter);
  container.innerHTML=list.map(p=>'<article class="produto-card" data-categoria="'+escapeHtml(p.categoria)+'">'+
   '<div class="produto-imagem"><div style="font-size:3rem">'+escapeHtml(p.imagem)+'</div>'+
   (p.destaque?'<span class="produto-badge">Destaque</span>':'')+'</div>'+
   '<div class="produto-info"><h3>'+escapeHtml(p.nome)+'</h3><p class="descricao">'+escapeHtml(p.descricao)+'</p>'+
   '<div class="produto-detalhes"><span class="preco">'+money(p.preco)+'</span><span class="tamanho">'+escapeHtml(p.tamanho)+'</span></div>'+
   '<button class="btn-add" data-product="'+p.id+'">+ Adicionar</button></div></article>').join('');
 };
 try{catalog=await Api.get('/api/products');render();}
 catch(e){container.textContent='Não foi possível carregar o cardápio: '+e.message;}
 container.addEventListener('click',e=>{
  const button=e.target.closest('[data-product]');if(!button)return;
  const product=catalog.find(p=>p.id===Number(button.dataset.product));
  if(product){carrinhoGlobal.add(product);button.textContent='✓ Adicionado!';setTimeout(()=>button.textContent='+ Adicionar',1000);}
 });
 document.querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.filter-btn').forEach(t=>t.classList.toggle('active',t===b));
  render(b.dataset.filter);
 }));
 form('btnFinalizarCompra')?.addEventListener('click',async()=>{
  const user=await userReady;
  if(!user){location.assign('login.html');return;}
  if(!carrinhoGlobal.itens.length)return;
  form('nomeCliente').value=user.nome;
  form('emailCliente').value=user.email;
  form('telefoneCliente').value=user.telefone||'';
  form('resumoPedido').innerHTML=carrinhoGlobal.itens.map(i=>
   '<div>'+escapeHtml(i.nome)+' ('+i.quantidade+'x) — '+money(i.preco*i.quantidade)+'</div>').join('');
  form('totalPagamento').textContent=money(carrinhoGlobal.total());
  bootstrap.Modal.getInstance(form('carrinhoModal'))?.hide();
  bootstrap.Modal.getOrCreateInstance(form('confirmacaoPagamentoModal')).show();
 });
 form('btnConfirmarPagamento')?.addEventListener('click',async()=>{
  if(!carrinhoGlobal.itens.length)return;
  const payload={
   nome:form('nomeCliente').value.trim(),email:form('emailCliente').value.trim(),
   telefone:form('telefoneCliente').value.trim(),endereco:form('enderecoCliente').value.trim(),
   complemento:form('complementoCliente').value.trim(),cep:form('cepCliente').value.trim(),
   pagamento:document.querySelector('input[name="pagamento"]:checked').value,
   itens:carrinhoGlobal.itens.map(i=>({produtoId:i.id,quantidade:i.quantidade}))
  };
  if(!payload.nome||!payload.email||!payload.telefone||!payload.endereco||!payload.cep){
   announce('Preencha os dados obrigatórios.');return;
  }
  const button=form('btnConfirmarPagamento');button.disabled=true;
  try{
   const order=await Api.post('/api/orders',payload);
   carrinhoGlobal.clear();form('numPedido').textContent=order.numeroPedido;
   bootstrap.Modal.getInstance(form('confirmacaoPagamentoModal'))?.hide();
   bootstrap.Modal.getOrCreateInstance(form('sucessoModal')).show();
  }catch(e){announce(e.message);}
  finally{button.disabled=false;}
 });
});
