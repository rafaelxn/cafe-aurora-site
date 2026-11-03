document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('signupForm');
 if(!form)return;
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const val=id=>document.getElementById(id).value.trim();
  const password=document.getElementById('regSenha').value;
  const errBox=document.getElementById('errorMessage');
  const errText=document.getElementById('errorText');
  const fail=message=>{errText.textContent=message;errBox.classList.remove('d-none');};
  if(password!==document.getElementById('regSenhaConfirm').value)return fail('As senhas não coincidem');
  if(password.length<8)return fail('A senha deve ter no mínimo 8 caracteres');
  try{
   await Api.post('/api/auth/register',{nome:val('regNome'),email:val('regEmail'),
    telefone:val('regTelefone'),senha:password,newsletter:document.getElementById('newsletter').checked});
   activeUser=await Api.post('/api/auth/login',{email:val('regEmail'),senha:password});
   errBox.classList.add('d-none');form.style.display='none';
   document.getElementById('successMessage').classList.remove('d-none');
   setTimeout(()=>location.assign('pedidos.html'),800);
  }catch(e){fail(e.message);}
 });
});
