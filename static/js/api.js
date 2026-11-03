const Api = {
 async request(url,method='GET',body) {
  const headers={'Accept':'application/json'};
  if(body!==undefined)headers['Content-Type']='application/json';
  if(!['GET','HEAD'].includes(method)){
   const csrf=await fetch('/api/auth/csrf',{credentials:'same-origin'}).then(r=>r.json());
   headers['X-XSRF-TOKEN']=csrf.token;
  }
  let response;
  try{response=await fetch(url,{method,credentials:'same-origin',headers,body:body===undefined?undefined:JSON.stringify(body)});}
  catch(e){throw new Error('Servidor indisponível. Verifique a conexão com a API.');}
  if(response.status===204)return null;
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.message||data.detail||('Erro HTTP '+response.status));
  return data;
 },
 get(url){return this.request(url);},
 post(url,data){return this.request(url,'POST',data);},
 patch(url,data){return this.request(url,'PATCH',data);},
 logout(){return this.request('/api/auth/logout','POST');}
};
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(value){return Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function announce(message){alert(message);}
