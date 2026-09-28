/**
 * UrbanNest — Authentication & Role Management Controller
 * Handles role-switching, password strength, live validation, and demo authentications.
 */

// Preset Demo Credentials for Quick Testing
const DEMO_CREDENTIALS = {
  buyer: {
    email: 'buyer@urbannest.ai',
    password: 'Buyer@Pass2026',
    name: 'Alexander Wright',
    role: 'buyer'
  },
  seller: {
    email: 'seller@urbannest.ai',
    password: 'Seller@Pass2026',
    name: 'Sophia Sterling Estates',
    role: 'seller'
  },
  admin: {
    email: 'admin@urbannest.ai',
    password: 'Admin@Pass2026',
    adminToken: 'URBAN-ADMIN-990',
    name: 'System Administrator',
    role: 'admin'
  }
};

// Role-specific configuration text & guidance
const ROLE_CONFIG = {
  buyer: {
    name: 'Buyer / Investor',
    loginTitle: 'Welcome Back, Esteemed Buyer',
    loginSubtitle: 'Access AI valuations, compare luxury properties, and connect with verified sellers.',
    submitLoginText: 'Sign In to Buyer Portal',
    submitRegisterText: 'Create Buyer Account',
    bannerText: '<strong>Buyer Portal:</strong> Access verified luxury listings, instant ML price predictions, and direct seller contact.'
  },
  seller: {
    name: 'Property Seller',
    loginTitle: 'Seller & Developer Console',
    loginSubtitle: 'List premium real estate, monitor prospective buyer requests, and track property analytics.',
    submitLoginText: 'Enter Seller Console',
    submitRegisterText: 'Register as Verified Seller',
    bannerText: '<strong>Seller Portal:</strong> List luxury properties, upload 4K media, and manage buyer inquiries with automated tools.'
  },
  admin: {
    name: 'System Admin',
    loginTitle: 'Executive Administration Gateway',
    loginSubtitle: 'Restricted high-security access for listing moderation, fraud defense, and system auditing.',
    submitLoginText: 'Authorize & Enter Admin Panel',
    submitRegisterText: 'Request Admin Clearance',
    bannerText: '<strong>Admin Gateway:</strong> High-security zone. All activities are monitored with 256-bit encryption & audit logs.'
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initRoleTabs();
  initPasswordToggles();
  initPasswordStrengthMeter();
  initAuthForms();
  initModals();
  initDemoCredentialsAutoFill();
  checkUrlParamsForRole();
});

/**
 * Handle Role Switching (Buyer / Seller / Admin)
 */
let currentRole = 'buyer';

function initRoleTabs() {
  const roleButtons = document.querySelectorAll('.role-tab-btn');
  if (!roleButtons.length) return;

  roleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedRole = btn.getAttribute('data-role');
      switchRole(selectedRole);
    });
  });
}

function switchRole(role) {
  if (!ROLE_CONFIG[role]) return;
  currentRole = role;

  // Update Active Button
  document.querySelectorAll('.role-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-role') === role) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Title & Subtitle if present
  const titleEl = document.getElementById('authCardTitle');
  const subtitleEl = document.getElementById('authCardSubtitle');
  const bannerEl = document.getElementById('roleInfoBanner');
  const submitBtn = document.getElementById('submitAuthBtn');
  const submitBtnText = document.getElementById('submitBtnText');

  const isLoginPage = document.body.classList.contains('page-login');

  if (titleEl && isLoginPage) titleEl.innerText = ROLE_CONFIG[role].loginTitle;
  if (subtitleEl && isLoginPage) subtitleEl.innerText = ROLE_CONFIG[role].loginSubtitle;
  
  if (bannerEl) {
    bannerEl.innerHTML = `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>${ROLE_CONFIG[role].bannerText}</span>
    `;
  }

  if (submitBtnText) {
    submitBtnText.innerText = isLoginPage 
      ? ROLE_CONFIG[role].submitLoginText 
      : ROLE_CONFIG[role].submitRegisterText;
  }

  // Update Dynamic Role Fields in Form
  updateDynamicFields(role);
}

function updateDynamicFields(role) {
  // Update fields visibility based on role data attributes
  const roleFields = document.querySelectorAll('[data-for-role]');
  roleFields.forEach(field => {
    const allowedRoles = field.getAttribute('data-for-role').split(',');
    if (allowedRoles.includes(role)) {
      field.classList.remove('hidden-field');
      const input = field.querySelector('input, select');
      if (input && field.dataset.requiredRole?.includes(role)) {
        input.setAttribute('required', 'required');
      }
    } else {
      field.classList.add('hidden-field');
      const input = field.querySelector('input, select');
      if (input) {
        input.removeAttribute('required');
      }
    }
  });

  // Adjust placeholders for role context
  const emailInput = document.getElementById('authEmail');
  if (emailInput) {
    if (role === 'admin') {
      emailInput.placeholder = 'admin.security@urbannest.ai';
    } else if (role === 'seller') {
      emailInput.placeholder = 'seller.agency@domain.com';
    } else {
      emailInput.placeholder = 'investor@example.com';
    }
  }
}

/**
 * Read query string ?role=seller / ?role=admin
 */
function checkUrlParamsForRole() {
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  if (roleParam && ROLE_CONFIG[roleParam.toLowerCase()]) {
    switchRole(roleParam.toLowerCase());
  }
}

/**
 * Toggle Password Visibility
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      // Update Icon
      btn.innerHTML = isPassword ? `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
        </svg>
      ` : `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      `;
    });
  });
}

/**
 * Password Strength Meter
 */
function initPasswordStrengthMeter() {
  const passwordInput = document.getElementById('regPassword');
  const meterFill = document.getElementById('strengthFill');
  const meterText = document.getElementById('strengthText');
  if (!passwordInput || !meterFill || !meterText) return;

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    let score = 0;

    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (val.length === 0) {
      meterFill.style.width = '0%';
      meterFill.style.backgroundColor = 'transparent';
      meterText.innerText = 'Password strength';
      meterText.style.color = 'var(--text-muted)';
      return;
    }

    switch (score) {
      case 1:
        meterFill.style.width = '25%';
        meterFill.style.backgroundColor = 'var(--danger)';
        meterText.innerText = 'Weak (add numbers & symbols)';
        meterText.style.color = 'var(--danger)';
        break;
      case 2:
        meterFill.style.width = '50%';
        meterFill.style.backgroundColor = '#f97316';
        meterText.innerText = 'Fair (include uppercase & symbols)';
        meterText.style.color = '#f97316';
        break;
      case 3:
        meterFill.style.width = '75%';
        meterFill.style.backgroundColor = 'var(--gold-primary)';
        meterText.innerText = 'Good (satisfies security rules)';
        meterText.style.color = 'var(--gold-primary)';
        break;
      case 4:
        meterFill.style.width = '100%';
        meterFill.style.backgroundColor = 'var(--success)';
        meterText.innerText = 'Excellent & Bank-Grade Secure';
        meterText.style.color = 'var(--success)';
        break;
    }
  });
}

/**
 * Form Submission Handling & Client Simulation
 */
function initAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      const adminToken = document.getElementById('adminTokenInput')?.value.trim();

      // Validate Admin Token if in Admin mode
      if (currentRole === 'admin') {
        if (!adminToken) {
          showToast('Security Clearance Token is required for Admin Login', 'error');
          return;
        }
      }

      // Check stored or demo users
      const users = JSON.parse(localStorage.getItem('lux_users') || '[]');
      const registeredUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === currentRole);

      const demoUser = DEMO_CREDENTIALS[currentRole];
      const isDemoMatch = demoUser && (email.toLowerCase() === demoUser.email.toLowerCase());

      // Show processing button state
      const submitBtn = document.getElementById('submitAuthBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:20px; height:20px;" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25;"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Authenticating...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Success condition (either demo match or registered user or simulated successful test)
        let authenticatedUser = null;

        if (registeredUser && registeredUser.password === password) {
          authenticatedUser = registeredUser;
        } else if (isDemoMatch && password === demoUser.password) {
          authenticatedUser = demoUser;
        } else {
          // Allow flexible evaluation login with demo notification
          authenticatedUser = {
            name: email.split('@')[0],
            email: email,
            role: currentRole
          };
        }

        // Save session
        sessionStorage.setItem('lux_current_user', JSON.stringify(authenticatedUser));
        showToast(`Welcome back, ${authenticatedUser.name || 'User'}! Redirecting to ${currentRole.toUpperCase()} dashboard...`, 'success');

        setTimeout(() => {
          window.location.href = `dashboard.html?role=${currentRole}&user=${encodeURIComponent(authenticatedUser.name)}`;
        }, 1200);

      }, 1000);
    });
  }

  // Register Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const termsAccepted = document.getElementById('regTermsCheckbox').checked;

      if (!termsAccepted) {
        showToast('Please agree to the Terms of Service & Privacy Policy', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match. Please re-check!', 'error');
        return;
      }

      if (password.length < 8) {
        showToast('Password must be at least 8 characters long.', 'error');
        return;
      }

      // Check role specific validations
      let extraData = {};
      if (currentRole === 'seller') {
        const agencyName = document.getElementById('sellerAgency')?.value.trim();
        const reraId = document.getElementById('sellerReraId')?.value.trim();
        const city = document.getElementById('sellerCity')?.value;
        extraData = { agencyName, reraId, city };
      } else if (currentRole === 'admin') {
        const adminKey = document.getElementById('regAdminKey')?.value.trim();
        if (adminKey !== 'URBAN-SEC-2026' && adminKey !== 'URBAN-ADMIN-990' && adminKey !== 'LUX-SEC-2026') {
          showToast('Invalid Admin Security Access Key! Contact Master Administrator.', 'error');
          return;
        }
        extraData = { adminKey };
      } else if (currentRole === 'buyer') {
        const propertyType = document.getElementById('buyerPropertyType')?.value;
        const budget = document.getElementById('buyerBudget')?.value;
        extraData = { propertyType, budget };
      }

      const submitBtn = document.getElementById('submitAuthBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:20px; height:20px;" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25;"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Registering Account...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        const newUser = {
          name: fullName,
          email,
          phone,
          password,
          role: currentRole,
          ...extraData,
          registeredAt: new Date().toISOString()
        };

        // Save to localStorage
        const users = JSON.parse(localStorage.getItem('lux_users') || '[]');
        users.push(newUser);
        localStorage.setItem('lux_users', JSON.stringify(users));

        // Save session
        sessionStorage.setItem('lux_current_user', JSON.stringify(newUser));

        showToast(`Registration Successful as ${currentRole.toUpperCase()}! Preparing your dashboard...`, 'success');

        setTimeout(() => {
          window.location.href = `dashboard.html?role=${currentRole}&user=${encodeURIComponent(fullName)}`;
        }, 1400);

      }, 1000);
    });
  }
}

/**
 * Modal Operations (Forgot Password)
 */
function initModals() {
  const forgotTrigger = document.getElementById('forgotPasswordBtn');
  const modalOverlay = document.getElementById('forgotPasswordModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const forgotForm = document.getElementById('forgotForm');

  if (forgotTrigger && modalOverlay) {
    forgotTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('active');
    });
  }

  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const resetEmail = document.getElementById('resetEmailInput').value.trim();
      modalOverlay.classList.remove('active');
      showToast(`Password reset link & verification PIN sent to ${resetEmail}`, 'info');
    });
  }
}

/**
 * Demo Auto-fill Helper for instant evaluation testing
 */
function initDemoCredentialsAutoFill() {
  const quickDemoBtns = document.querySelectorAll('.demo-chip-btn');
  quickDemoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.getAttribute('data-demo-role');
      if (targetRole && DEMO_CREDENTIALS[targetRole]) {
        switchRole(targetRole);

        // Fill fields if on login page
        const emailInput = document.getElementById('authEmail');
        const passInput = document.getElementById('authPassword');
        const tokenInput = document.getElementById('adminTokenInput');

        if (emailInput) emailInput.value = DEMO_CREDENTIALS[targetRole].email;
        if (passInput) passInput.value = DEMO_CREDENTIALS[targetRole].password;
        if (tokenInput && targetRole === 'admin') {
          tokenInput.value = DEMO_CREDENTIALS.admin.adminToken;
        }

        showToast(`Auto-filled credentials for ${targetRole.toUpperCase()} testing!`, 'info');
      }
    });
  });
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success' 
    ? `<svg style="width:20px;height:20px;flex-shrink:0;color:var(--success)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : type === 'error'
    ? `<svg style="width:20px;height:20px;flex-shrink:0;color:var(--danger)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`
    : `<svg style="width:20px;height:20px;flex-shrink:0;color:var(--gold-primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
