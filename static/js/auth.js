let activeUser = null;

const userReady = (async () => {
  try {
    activeUser = await Api.get('/api/auth/me');
  } catch {
    activeUser = null;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNav, { once: true });
  } else {
    updateNav();
  }

  const page = location.pathname.split('/').pop();
  if (['pedidos.html', 'administrativo.html'].includes(page) && !activeUser) {
    location.replace('login.html');
    return null;
  }

  if (page === 'administrativo.html' && activeUser.role !== 'ADMIN') {
    location.replace('index.html');
    return null;
  }

  return activeUser;
})();

function currentUser() {
  return activeUser;
}

function updateNav() {
  function toggle(id, visible, display = 'block') {
    const element = document.getElementById(id);
    if (element) element.style.display = visible ? display : 'none';
  }

  toggle('btn-login-nav', !activeUser);
  toggle('nav-usuario', Boolean(activeUser), 'flex');
  toggle('nav-pedidos', Boolean(activeUser));
  toggle('nav-admin', activeUser?.role === 'ADMIN');

  const label = document.getElementById('usuario-nome');
  if (label && activeUser) label.textContent = activeUser.nome.split(' ')[0];
}

async function doLogout() {
  try {
    await Api.logout();
    activeUser = null;
    updateNav();
    location.assign('index.html');
  } catch (error) {
    announce(error.message);
  }
}

async function signIn(email, password) {
  activeUser = await Api.post('/api/auth/login', {
    email: email.trim().toLowerCase(),
    senha: password
  });
  updateNav();
  location.assign(activeUser.role === 'ADMIN' ? 'administrativo.html' : 'pedidos.html');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#btn-logout, #btnSair').forEach(button => {
    button.addEventListener('click', doLogout);
  });

  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.toggle('active', tab === button);
      });

      const formId = button.dataset.tab === 'login' ? 'loginForm' : 'cadastroForm';
      document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === formId);
      });
    });
  });

  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = loginForm.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      await signIn(
        document.getElementById('loginEmail').value,
        document.getElementById('loginSenha').value
      );
    } catch (error) {
      announce(error.message);
      button.disabled = false;
    }
  });

  const registerForm = document.getElementById('cadastroForm');
  registerForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = registerForm.querySelector('[type="submit"]');
    button.disabled = true;
    const email = document.getElementById('cadEmail').value;
    const password = document.getElementById('cadSenha').value;

    try {
      await Api.post('/api/auth/register', {
        nome: document.getElementById('cadNome').value,
        email,
        senha: password
      });
      await signIn(email, password);
    } catch (error) {
      announce(error.message);
      button.disabled = false;
    }
  });
});
