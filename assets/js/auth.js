// =====================================================
// Auth Helper Functions
// =====================================================
// Client-side authentication using SHA-256 + sessionStorage
// =====================================================

// SHA-256 hash function using Web Crypto API (native browser)
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Check if user is authenticated
function isAuthenticated() {
  return sessionStorage.getItem('mermaid_auth') === 'true';
}

// Get current logged-in user info
function getCurrentUser() {
  try {
    const userData = sessionStorage.getItem('mermaid_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

// Check if current user is admin
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Auth guard - redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Auth guard - redirect to index if not admin
function requireAdmin() {
  if (!requireAuth()) return false;
  if (!isAdmin()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Login function
async function login(username, password) {
  const hash = await hashPassword(password);
  const user = findUser(username);

  if (user && user.passwordHash === hash) {
    sessionStorage.setItem('mermaid_auth', 'true');
    sessionStorage.setItem('mermaid_user', JSON.stringify({
      username: user.username,
      role: user.role
    }));
    return { success: true, user: { username: user.username, role: user.role } };
  }

  return { success: false, error: 'Invalid username or password!' };
}

// Logout function
function logout() {
  sessionStorage.removeItem('mermaid_auth');
  sessionStorage.removeItem('mermaid_user');
  window.location.href = 'login.html';
}