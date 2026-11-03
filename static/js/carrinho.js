class Carrinho {
 constructor(){
  try{this.itens=JSON.parse(localStorage.getItem('carrinho-cafe'))||[];}
  catch(e){this.itens=[];}
  if(!Array.isArray(this.itens))this.itens=[];
  this.itens=this.itens.filter(i=>Number.isSafeInteger(i.id)&&i.id>0&&Number.isSafeInteger(i.quantidade)&&i.quantidade>0&&i.quantidade<=99&&Number.isFinite(i.preco)&&i.preco>=0);
  this.update();
 }
 add(product){
  const item=this.itens.find(i=>i.id===product.id);
  if(item)item.quantidade=Math.min(99,item.quantidade+1);
  else this.itens.push({id:product.id,nome:product.nome,preco:Number(product.preco),tamanho:product.tamanho,quantidade:1});
  this.update();
 }
 remove(id){this.itens=this.itens.filter(i=>i.id!==id);this.update();}
 change(id,step){
  const item=this.itens.find(i=>i.id===id);if(!item)return;
  item.quantidade=Math.min(99,item.quantidade+step);
  if(item.quantidade<=0)this.remove(id);else this.update();
 }
 clear(){this.itens=[];this.update();}
 total(){return this.itens.reduce((a,i)=>a+i.preco*i.quantidade,0);}
 update(){
  localStorage.setItem('carrinho-cafe',JSON.stringify(this.itens));
  const badge=document.getElementById('cartBadge');
  if(badge){const count=this.itens.reduce((a,i)=>a+i.quantidade,0);badge.textContent=count;badge.style.display=count?'block':'none';}
 }
 render(){
  const target=document.getElementById('carrinhoConteudo');
  const total=document.getElementById('totalCarrinho');
  const button=document.getElementById('btnFinalizarCompra');
  if(!target)return;
  target.innerHTML=this.itens.length?this.itens.map(i=>
   '<div class="d-flex justify-content-between align-items-center border-bottom py-2"><div><strong>'+escapeHtml(i.nome)+
   '</strong><div>'+money(i.preco)+' × '+i.quantidade+'</div></div><div><button class="btn btn-sm btn-outline-secondary" data-step="-1" data-id="'+i.id+'">−</button> '+
   i.quantidade+' <button class="btn btn-sm btn-outline-secondary" data-step="1" data-id="'+i.id+'">+</button> <button class="btn btn-sm btn-outline-danger" data-remove="'+i.id+'">Remover</button></div></div>').join('')
   :'<p>Seu carrinho está vazio.</p>';
  total.textContent=money(this.total());button.disabled=!this.itens.length;
 }
}
let carrinhoGlobal;
document.addEventListener('DOMContentLoaded',()=>{
 carrinhoGlobal=new Carrinho();
 document.getElementById('btnCarrinho')?.addEventListener('click',()=>{
  carrinhoGlobal.render();bootstrap.Modal.getOrCreateInstance(document.getElementById('carrinhoModal')).show();
 });
 document.getElementById('carrinhoConteudo')?.addEventListener('click',e=>{
  const change=e.target.closest('[data-step]');
  const remove=e.target.closest('[data-remove]');
  if(change)carrinhoGlobal.change(Number(change.dataset.id),Number(change.dataset.step));
  if(remove)carrinhoGlobal.remove(Number(remove.dataset.remove));
  carrinhoGlobal.render();
 });
});
