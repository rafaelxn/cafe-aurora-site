let activeUser=null;
const userReady=(async()=>{
 try{activeUser=await Api.get('/api/auth/me');}catch(e){activeUser=null;}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateNav);else updateNav();
 const page=location.pathname.split('/').pop();
 if((page==='pedidos.html'||page==='administrativo.html')&&!activeUser){location.replace('login.html');return null;}
 if(page==='administrativo.html'&&activeUser.role!=='ADMIN'){location.replace('index.html');return null;}
 return activeUser;
})();
function currentUser(){return activeUser;}
function updateNav(){
 const set=(id,show,display='block')=>{const el=document.getElementById(id);if(el)el.style.display=show?display:'none';};
 set('btn-login-nav',!activeUser);set('nav-usuario',!!activeUser,'flex');
 set('nav-pedidos',!!activeUser);set('nav-admin',!!activeUser&&activeUser.role==='ADMIN');
 const label=document.getElementById('usuario-nome');
 if(label&&activeUser)label.textContent=activeUser.nome.split(' ')[0];
}
async function doLogout(){
 try{await Api.logout();activeUser=null;updateNav();location.assign('index.html');}
 catch(e){announce(e.message);}
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('#btn-logout,#btnSair').forEach(b=>b.addEventListener('click',doLogout));
 document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.tab-btn').forEach(t=>t.classList.toggle('active',t===b));
  document.querySelectorAll('.auth-form').forEach(f=>f.classList.toggle('active',f.id===(b.dataset.tab==='login'?'loginForm':'cadastroForm')));
 }));
 const login=document.getElementById('loginForm');
 if(login)login.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   activeUser=await Api.post('/api/auth/login',{email:document.getElementById('loginEmail').value,senha:document.getElementById('loginSenha').value});
   location.assign(activeUser.role==='ADMIN'?'administrativo.html':'pedidos.html');
  }catch(err){announce(err.message);}
 });
 const register=document.getElementById('cadastroForm');
 if(register)register.addEventListener('submit',async e=>{
  e.preventDefault();
  try{
   await Api.post('/api/auth/register',{nome:document.getElementById('cadNome').value,email:document.getElementById('cadEmail').value,senha:document.getElementById('cadSenha').value});
   activeUser=await Api.post('/api/auth/login',{email:document.getElementById('cadEmail').value,senha:document.getElementById('cadSenha').value});
   location.assign('pedidos.html');
  }catch(err){announce(err.message);}
 });
});
