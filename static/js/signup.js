document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const errorBox = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const value = id => document.getElementById(id).value.trim();

  function showError(message) {
    errorText.textContent = message;
    errorBox.classList.remove('d-none');
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const password = document.getElementById('regSenha').value;
    if (password !== document.getElementById('regSenhaConfirm').value) {
      showError('As senhas não coincidem.');
      return;
    }
    if (password.length < 8) {
      showError('A senha precisa ter no mínimo 8 caracteres.');
      return;
    }

    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const email = value('regEmail');
      await Api.post('/api/auth/register', {
        nome: value('regNome'),
        email,
        telefone: value('regTelefone'),
        senha: password,
        newsletter: document.getElementById('newsletter').checked
      });

      activeUser = await Api.post('/api/auth/login', {
        email: email.toLowerCase(),
        senha: password
      });

      errorBox.classList.add('d-none');
      form.style.display = 'none';
      document.getElementById('successMessage').classList.remove('d-none');
      setTimeout(() => location.assign('pedidos.html'), 800);
    } catch (error) {
      showError(error.message);
      button.disabled = false;
    }
  });
});
