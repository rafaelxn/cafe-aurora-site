const USERS_KEY = 'cafe_aurora_users';
const CURRENT_USER_KEY = 'cafe_aurora_current_user';

const defaultUsers = [
  { id: 1, nome: 'Admin Aurora', email: 'admin@aurora.com', senha: 'admin123', tipo: 'gerente' },
  { id: 2, nome: 'Cliente Demo', email: 'cliente@aurora.com', senha: 'cliente123', tipo: 'cliente' }
];

function getUsers() {
  const storage = localStorage.getItem(USERS_KEY);
  if (!storage) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return [...defaultUsers];
  }
  return JSON.parse(storage);
}

function setUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function currentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function redirectIfNotLogged(target = 'login.html') {
  if (!currentUser()) {
    window.location.href = target;
    return true;
  }
  return false;
}

function redirectIfNotAdmin() {
  const user = currentUser();
  if (!user || user.tipo !== 'gerente') {
    window.location.href = 'login.html';
    return true;
  }
  return false;
}

function renderUserNav() {
  const user = currentUser();
  const navPedidos = document.getElementById('nav-pedidos');
  const navAdmin = document.getElementById('nav-admin');
  const navUsuario = document.getElementById('nav-usuario');
  const btnLogin = document.getElementById('btn-login-nav');
  const usuarioNome = document.getElementById('usuario-nome');

  if (!user) {
    if (navPedidos) navPedidos.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
    if (navUsuario) navUsuario.style.display = 'none';
    if (btnLogin) btnLogin.style.display = 'inline-block';
    return;
  }

  if (navUsuario) navUsuario.style.display = 'flex';
  if (btnLogin) btnLogin.style.display = 'none';

  if (usuarioNome) usuarioNome.textContent = user.nome.split(' ')[0];

  if (user.tipo === 'cliente') {
    if (navPedidos) navPedidos.style.display = 'block';
    if (navAdmin) navAdmin.style.display = 'none';
  }

  if (user.tipo === 'gerente') {
    if (navPedidos) navPedidos.style.display = 'block';
    if (navAdmin) navAdmin.style.display = 'block';
  }
}

function setupAuthEvents() {
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      clearCurrentUser();
      window.location.href = 'index.html';
    });
  }

  const logoutBtnPage = document.getElementById('btnSair');
  if (logoutBtnPage) {
    logoutBtnPage.addEventListener('click', function () {
      clearCurrentUser();
      window.location.href = 'index.html';
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const senha = document.getElementById('loginSenha').value.trim();

      if (!email || !senha) {
        alert('Preencha e-mail e senha.');
        return;
      }

      const users = getUsers();
      const found = users.find((u) => u.email === email && u.senha === senha);
      if (!found) {
        alert('Credenciais inválidas.');
        return;
      }

      setCurrentUser(found);
      if (found.tipo === 'gerente') {
        window.location.href = 'administrativo.html';
      } else {
        window.location.href = 'pedidos.html';
      }
    });
  }

  const cadastroForm = document.getElementById('cadastroForm');
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const nome = document.getElementById('cadNome').value.trim();
      const email = document.getElementById('cadEmail').value.trim();
      const senha = document.getElementById('cadSenha').value.trim();

      if (!nome || !email || !senha) {
        alert('Preencha todos os campos.');
        return;
      }

      const users = getUsers();
      const exists = users.some((u) => u.email === email);
      if (exists) {
        alert('Este e-mail já está cadastrado.');
        return;
      }

      const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        senha,
        tipo: 'cliente'
      };

      users.push(novoUsuario);
      setUsers(users);
      setCurrentUser(novoUsuario);
      alert('Cadastro realizado com sucesso!');
      window.location.href = 'pedidos.html';
    });
  }

  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach((button) => {
    button.addEventListener('click', function () {
      const target = this.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
      this.classList.add('active');

      document.getElementById('loginForm').classList.toggle('active', target === 'login');
      document.getElementById('cadastroForm').classList.toggle('active', target === 'cadastro');
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  renderUserNav();
  setupAuthEvents();
});
