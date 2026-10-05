document.addEventListener('DOMContentLoaded', function() {
  atualizarNavegacao();

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function(e) {
      e.preventDefault();
      fazerLogout();
    });
  }

  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      mostrarTab(tabName);
    });
  });

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      processarLogin();
    });
  }

  const cadastroForm = document.getElementById('cadastroForm');
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', function(e) {
      e.preventDefault();
      processarCadastro();
    });
  }
});

function mostrarTab(tabName) {
  const forms = document.querySelectorAll('.auth-form');
  forms.forEach(form => form.classList.remove('active'));

  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  const formId = tabName === 'login' ? 'loginForm' : 'cadastroForm';
  const form = document.getElementById(formId);
  if (form) form.classList.add('active');

  const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeButton) activeButton.classList.add('active');
}

function processarLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;

  if (!email || !senha) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuarioEncontrado) {
    localStorage.setItem('usuarioAtual', JSON.stringify({
      id: usuarioEncontrado.id,
      nome: usuarioEncontrado.nome,
      email: usuarioEncontrado.email
    }));

    window.location.href = 'pedidos.html';
  } else {
    alert('E-mail ou senha incorretos');
  }
}

function processarCadastro() {
  const nome = document.getElementById('cadNome').value.trim();
  const email = document.getElementById('cadEmail').value.trim();
  const senha = document.getElementById('cadSenha').value;

  if (!nome || !email || !senha) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  if (senha.length < 6) {
    alert('A senha deve ter no mínimo 6 caracteres');
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  if (usuarios.some(u => u.email === email)) {
    alert('Este e-mail já está cadastrado');
    return;
  }

  const novoUsuario = {
    id: Date.now(),
    nome: nome,
    email: email,
    senha: senha,
    dataCriacao: new Date().toISOString()
  };

  usuarios.push(novoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('usuarioAtual', JSON.stringify({
    id: novoUsuario.id,
    nome: novoUsuario.nome,
    email: novoUsuario.email
  }));

  alert('Conta criada com sucesso!');
  window.location.href = 'pedidos.html';
}

function atualizarNavegacao() {
  const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
  const navLogin = document.getElementById('btn-login-nav');
  const navUsuario = document.getElementById('nav-usuario');
  const navPedidos = document.getElementById('nav-pedidos');
  const navAdmin = document.getElementById('nav-admin');
  const usuarioNome = document.getElementById('usuario-nome');

  if (usuarioAtual) {
    if (navLogin) navLogin.style.display = 'none';
    if (navUsuario) navUsuario.style.display = 'flex';
    if (navPedidos) navPedidos.style.display = 'block';
    if (usuarioNome) usuarioNome.textContent = usuarioAtual.nome.split(' ')[0];
  } else {
    if (navLogin) navLogin.style.display = 'block';
    if (navUsuario) navUsuario.style.display = 'none';
    if (navPedidos) navPedidos.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
  }
}

function fazerLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('usuarioAtual');
    atualizarNavegacao();
    window.location.href = 'index.html';
  }
}

function verificarLogin() {
  const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));
  if (!usuarioAtual && window.location.pathname.includes('pedidos.html')) {
    window.location.href = 'login.html';
  }
}

verificarLogin();
