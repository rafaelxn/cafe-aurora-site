document.addEventListener('DOMContentLoaded',async()=>{
 const user=await userReady;if(!user)return;
 document.getElementById('clienteNome').textContent=user.nome.split(' ')[0];
 const root=document.getElementById('listaPedidos');
 const names={pendente:'Pendente',em_atendimento:'Em atendimento',finalizado:'Finalizado'};
 try{
  const pedidos=await Api.get('/api/orders');
  root.innerHTML=pedidos.length?pedidos.map(p=>
   '<article class="card mb-3"><div class="card-body"><h3 class="h5">Pedido #'+p.id+'</h3>'+
   '<p><strong>Status:</strong> '+(names[p.status]||escapeHtml(p.status))+'</p>'+
   '<p><strong>Data:</strong> '+new Date(p.data).toLocaleString('pt-BR')+'</p>'+
   '<p><strong>Itens:</strong> '+p.itens.map(i=>escapeHtml(i.nome)+' ('+i.quantidade+'x)').join(', ')+'</p>'+
   '<p><strong>Total:</strong> '+money(p.total)+'</p></div></article>').join('')
   :'<p>Nenhum pedido realizado. <a href="produtos.html">Ver cardápio</a></p>';
 }catch(e){root.textContent=e.message;}
});
