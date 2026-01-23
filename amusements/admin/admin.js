// STEP 2: Admin Login Logic
// Handles login form submission and authentication

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('login-form');
  const errorDiv = document.getElementById('error-message');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorDiv.style.display = 'none';
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const res = await fetch('https://smartverse-vr-api.smartbf.workers.dev/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        window.location.href = '/amusements/admin/dashboard';
      } else {
        showError(data.error || 'Login failed.');
      }
    } catch (err) {
      showError('Network error. Please try again.');
    }
  });

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }
});
// STEP 2 END
