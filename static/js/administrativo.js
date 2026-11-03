document.addEventListener('DOMContentLoaded',async()=>{
 const user=await userReady;if(!user||user.role!=='ADMIN')return;
 const root=document.getElementById('adminPedidos');
 const names={pendente:'Pendentes',em_atendimento:'Em atendimento',finalizado:'Finalizados'};
 let orders=[];
 let status='pendente';
 async function load(){
  try{orders=await Api.get('/api/admin/orders');render();}
  catch(e){root.textContent=e.message;}
 }
 function render(){
  document.querySelectorAll('.admin-tab').forEach(b=>b.classList.toggle('active',b.dataset.status===status));
  const filtered=orders.filter(o=>o.status===status);
  root.innerHTML=filtered.length?filtered.map(p=>
   '<article class="admin-card"><h3>Pedido #'+p.id+'</h3>'+
   '<p><strong>Cliente:</strong> '+escapeHtml(p.clienteNome)+'</p>'+
   '<p><strong>Telefone:</strong> '+escapeHtml(p.telefone)+'</p>'+
   '<p><strong>Endereço:</strong> '+escapeHtml(p.endereco)+'</p>'+
   '<p><strong>Status:</strong> '+names[p.status]+'</p>'+
   '<p><strong>Itens:</strong> '+p.itens.map(i=>i.quantidade+'x '+escapeHtml(i.nome)).join(', ')+'</p>'+
   '<p><strong>Total:</strong> '+money(p.total)+'</p>'+
   (status==='finalizado'?'':'<button class="btn btn-coffee" data-id="'+p.id+'"> '+(status==='pendente'?'Iniciar atendimento':'Finalizar')+'</button>')+
   '</article>').join(''):'<p>Nenhum pedido nesta categoria.</p>';
 }
 document.querySelectorAll('.admin-tab').forEach(b=>b.addEventListener('click',()=>{status=b.dataset.status;render();}));
 root.addEventListener('click',async e=>{
  const b=e.target.closest('[data-id]');if(!b)return;
  b.disabled=true;
  try{await Api.patch('/api/admin/orders/'+b.dataset.id+'/status',
   {status:status==='pendente'?'em_atendimento':'finalizado'});await load();}
  catch(err){announce(err.message);b.disabled=false;}
 });
 await load();
});
