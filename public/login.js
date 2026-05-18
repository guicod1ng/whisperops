/* login.js */
const API = window.location.origin;
// ========== HELPER FUNCTIONS ==========

// Toggle loading state
const setLoading = (form, isLoading) => {
  const btn = form.querySelector('.submit-btn');
  const formId = form.id;
  
  if (isLoading) {
    btn.classList.add('loading');
    btn.disabled = true;
    // Disable inputs
    form.querySelectorAll('input').forEach(input => input.disabled = true);
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    form.querySelectorAll('input').forEach(input => input.disabled = false);
  }
};

// Validate email
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Show field error
const showFieldError = (inputId, message) => {
  const input = document.getElementById(inputId);
  const wrapper = input.closest('.input-wrapper');
  const errorEl = document.getElementById(inputId + 'Error');
  
  wrapper.classList.add('has-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
};

// Clear field error
const clearFieldError = (inputId) => {
  const input = document.getElementById(inputId);
  const wrapper = input.closest('.input-wrapper');
  const errorEl = document.getElementById(inputId + 'Error');
  
  wrapper.classList.remove('has-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
};

// Clear all errors
const clearAllErrors = () => {
  document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  document.querySelectorAll('.error-text').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  document.getElementById('erro').style.display = 'none';
};

// Show global error
const showError = (message) => {
  const erroEl = document.getElementById('erro');
  erroEl.textContent = message;
  erroEl.style.display = 'block';
  // Trigger reflow for animation
  erroEl.style.animation = 'none';
  erroEl.offsetHeight;
  erroEl.style.animation = 'shake 0.5s ease-in-out';
};

// Toggle password visibility
const setupPasswordToggle = (toggleBtnId, inputId) => {
  const toggleBtn = document.getElementById(toggleBtnId);
  const input = document.getElementById(inputId);
  const icon = toggleBtn.querySelector('i');
  
  toggleBtn.addEventListener('click', () => {
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });
};

// ========== LOGIN FORM ==========

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllErrors();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const lembrar = document.getElementById('lembrar')?.checked || false;

  // Validation
  let hasError = false;
  
  if (!email) {
    showFieldError('email', 'Email é obrigatório');
    hasError = true;
  } else if (!validateEmail(email)) {
    showFieldError('email', 'Email inválido');
    hasError = true;
  }
  
  if (!senha) {
    showFieldError('senha', 'Senha é obrigatória');
    hasError = true;
  }
  
  if (hasError) return;

  setLoading(loginForm, true);

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha, lembrar }),
    });

    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('whisperops_token', data.token);
      if (document.getElementById('lembrar').checked) {
        localStorage.setItem('whisperops_email', email);
      } else {
        localStorage.removeItem('whisperops_email');
      }
      if (data.usuario) {
        localStorage.setItem('whisperops_user', JSON.stringify(data.usuario));
      }
      window.location.href = '/dashboard.html';
    } else {
      showError(data.erro || 'Erro ao fazer login');
    }
  } catch (err) {
    showError('Erro de conexão. Verifique sua rede.');
  } finally {
    setLoading(loginForm, false);
  }
});

// Clear error on input
loginForm.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    clearFieldError(input.id);
  });
});

// ========== REGISTER FORM ==========

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllErrors();

  const nome = document.getElementById('regNome').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const senha = document.getElementById('regSenha').value;

  // Validation
  let hasError = false;
  
  if (!nome) {
    showFieldError('regNome', 'Nome da empresa é obrigatório');
    hasError = true;
  } else if (nome.length < 2) {
    showFieldError('regNome', 'Nome deve ter pelo menos 2 caracteres');
    hasError = true;
  }
  
  if (!email) {
    showFieldError('regEmail', 'Email é obrigatório');
    hasError = true;
  } else if (!validateEmail(email)) {
    showFieldError('regEmail', 'Email inválido');
    hasError = true;
  }
  
  if (!senha) {
    showFieldError('regSenha', 'Senha é obrigatória');
    hasError = true;
  } else if (senha.length < 6) {
    showFieldError('regSenha', 'Senha deve ter pelo menos 6 caracteres');
    hasError = true;
  }
  
  if (hasError) return;

  setLoading(registerForm, true);

  try {
    const res = await fetch(`${API}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await res.json();
    
    if (res.ok) {
      alert('Conta criada com sucesso! Faça login.');
      toggleForms();
    } else {
      showError(data.erro || 'Erro ao cadastrar');
    }
  } catch (err) {
    showError('Erro de conexão. Verifique sua rede.');
  } finally {
    setLoading(registerForm, false);
  }
});

// Clear error on input
registerForm.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', () => {
    clearFieldError(input.id);
  });
});

// ========== TOGGLE FORMS ==========

const toggleAuth = document.getElementById('toggleAuth');
const toggleText = document.getElementById('toggleText');
const erroEl = document.getElementById('erro');

const toggleForms = () => {
  const loginFormVisible = loginForm.style.display !== 'none';
  
  if (loginFormVisible) {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    toggleText.textContent = 'Já tem conta?';
    toggleAuth.textContent = 'Entrar';
  } else {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    toggleText.textContent = 'Não tem conta?';
    toggleAuth.textContent = 'Cadastre-se';
  }
  
  // Clear errors
  erroEl.style.display = 'none';
  clearAllErrors();
};

toggleAuth.addEventListener('click', (e) => {
  e.preventDefault();
  toggleForms();
});

// ========== PASSWORD TOGGLES ==========

setupPasswordToggle('togglePassword', 'senha');
setupPasswordToggle('toggleRegPassword', 'regSenha');

// ========== KEYBOARD SHORTCUTS ==========

// Enter to submit
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const activeForm = document.getElementById('loginForm').style.display !== 'none' 
      ? loginForm 
      : registerForm;
    
    if (document.activeElement.tagName === 'INPUT') {
      e.preventDefault();
      activeForm.dispatchEvent(new Event('submit'));
    }
  }
});

// ========== INIT ==========

// Check for saved email (remember me)
const savedEmail = localStorage.getItem('whisperops_email');
if (savedEmail) {
  document.getElementById('email').value = savedEmail;
  document.getElementById('lembrar').checked = true;
}