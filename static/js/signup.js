document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signupForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');

  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const nome = document.getElementById('regNome').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const telefone = document.getElementById('regTelefone').value.trim();
      const senha = document.getElementById('regSenha').value;
      const senhaConfirm = document.getElementById('regSenhaConfirm').value;
      const termos = document.getElementById('termos').checked;
      const newsletter = document.getElementById('newsletter').checked;

      if (!nome || !email || !senha || !senhaConfirm) {
        showError('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (!isValidEmail(email)) {
        showError('Por favor, insira um e-mail válido');
        return;
      }

      if (senha.length < 6) {
        showError('A senha deve ter no mínimo 6 caracteres');
        return;
      }

      if (senha !== senhaConfirm) {
        showError('As senhas não coincidem');
        return;
      }

      if (!termos) {
        showError('Você deve aceitar os Termos de Serviço');
        return;
      }

      const novoUsuario = {
        id: Date.now(),
        nome: nome,
        email: email,
        telefone: telefone,
        senha: senha,
        newsletter: newsletter,
        dataCriacao: new Date().toISOString()
      };

      let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

      if (usuarios.some(u => u.email === email)) {
        showError('Este e-mail já está cadastrado. Faça <a href="login.html">login</a> ou use outro e-mail.');
        return;
      }

      usuarios.push(novoUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      localStorage.setItem('usuarioAtual', JSON.stringify({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email
      }));

      signupForm.style.display = 'none';
      successMessage.classList.remove('d-none');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    });
  }

  function showError(message) {
    errorText.innerHTML = message;
    errorMessage.classList.remove('d-none');
    successMessage.classList.add('d-none');

    setTimeout(() => {
      errorMessage.classList.add('d-none');
    }, 5000);
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});
