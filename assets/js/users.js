// =====================================================
// Users Configuration
// =====================================================
// Edit this file to add/remove users.
// 
// To generate a new SHA-256 hash, open browser console and run:
//   async function h(p){const m=new TextEncoder().encode(p);const b=await crypto.subtle.digest('SHA-256',m);return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
//   h('your_password_here').then(console.log)
//
// Or use the Hash Generator tool in the Admin page.
// =====================================================

const USERS_CONFIG = [
  {
    username: "admin",
    // Password: AdminIoT2026
    passwordHash: "ecb030b78a89c06f36bd64cbf52d84336208431225de8437a84ab359182a2670",
    role: "admin"
  },
  {
    username: "user",
    // Password: User1234
    passwordHash: "bd5cf8347e036cabe6cd37323186a02ef6c3589d19daaee31eeb2ae3b1507ebe",
    role: "user"
  }
];

// Users stored in localStorage (managed via Admin page)
// These are merged with USERS_CONFIG on load
function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem('mermaid_custom_users') || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  localStorage.setItem('mermaid_custom_users', JSON.stringify(users));
}

function getAllUsers() {
  return [...USERS_CONFIG, ...getLocalUsers()];
}

function findUser(username) {
  return getAllUsers().find(u => u.username === username);
}

function isLocalUser(username) {
  return getLocalUsers().some(u => u.username === username);
}

function removeLocalUser(username) {
  const users = getLocalUsers().filter(u => u.username !== username);
  saveLocalUsers(users);
}

function addLocalUser(userData) {
  const users = getLocalUsers();
  // Check duplicate
  if (getAllUsers().some(u => u.username === userData.username)) {
    return false;
  }
  users.push(userData);
  saveLocalUsers(users);
  return true;
}