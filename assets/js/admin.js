const currentUser = getCurrentUser();
if (currentUser) {
  document.getElementById('admin-username').textContent = currentUser.username;
}

function escapeHtmlAdmin(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function loadUsersTable() {
  const tbody = document.getElementById('users-table-body');
  const allUsers = getAllUsers();

  document.getElementById('stat-total').textContent = allUsers.length;
  document.getElementById('stat-admins').textContent = allUsers.filter(u => u.role === 'admin').length;
  document.getElementById('stat-users').textContent = allUsers.filter(u => u.role === 'user').length;

  tbody.innerHTML = '';

  allUsers.forEach(user => {
    const isConfigUser = !isLocalUser(user.username);
    const isSelf = currentUser && currentUser.username === user.username;
    const safeUsername = escapeHtmlAdmin(user.username);
    const safeHash = escapeHtmlAdmin(user.passwordHash);

    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 hover:bg-slate-50 transition-colors';
    row.innerHTML = `
      <td class="px-6 py-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full ${user.role === 'admin' ? 'bg-indigo-100' : 'bg-slate-100'} flex items-center justify-center">
            <span class="text-xs font-semibold ${user.role === 'admin' ? 'text-indigo-600' : 'text-slate-600'}">${safeUsername.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <span class="text-sm font-medium text-slate-900">${safeUsername}</span>
            ${isSelf ? '<span class="ml-1 text-xs text-indigo-500">(you)</span>' : ''}
          </div>
        </div>
      </td>
      <td class="px-6 py-3">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'admin'
            ? 'bg-indigo-100 text-indigo-800'
            : 'bg-slate-100 text-slate-800'
        }">
          ${user.role === 'admin' ? 'Admin' : 'User'}
        </span>
      </td>
      <td class="px-6 py-3">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          isConfigUser
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }">
          ${isConfigUser ? 'Config' : 'Local'}
        </span>
      </td>
      <td class="px-6 py-3">
        <span class="text-xs font-mono text-slate-500 truncate block max-w-[200px]" title="${safeHash}">${safeHash.substring(0, 20)}...</span>
      </td>
      <td class="px-6 py-3 text-right">
        ${isSelf ? `
          <span class="text-xs text-slate-400 italic">Cannot delete</span>
        ` : isConfigUser ? `
          <span class="text-xs text-slate-400 italic">Edit in users.js</span>
        ` : `
          <button onclick="handleDeleteUser('${safeUsername}')" class="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete
          </button>
        `}
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function handleAddUser(event) {
  event.preventDefault();

  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;
  const confirm = document.getElementById('new-password-confirm').value;
  const role = document.getElementById('new-role').value;

  const errorDiv = document.getElementById('add-error');
  const errorText = document.getElementById('add-error-text');
  const successDiv = document.getElementById('add-success');

  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');

  if (!username || !password) {
    errorText.textContent = 'Username and password are required!';
    errorDiv.classList.remove('hidden');
    return;
  }

  if (username.length < 3) {
    errorText.textContent = 'Username must be at least 3 characters!';
    errorDiv.classList.remove('hidden');
    return;
  }

  if (password.length < 6) {
    errorText.textContent = 'Password must be at least 6 characters!';
    errorDiv.classList.remove('hidden');
    return;
  }

  if (password !== confirm) {
    errorText.textContent = 'Passwords do not match!';
    errorDiv.classList.remove('hidden');
    return;
  }

  const hash = await hashPassword(password);

  const result = addLocalUser({
    username: username,
    passwordHash: hash,
    role: role
  });

  if (!result) {
    errorText.textContent = `Username "${username}" is already taken!`;
    errorDiv.classList.remove('hidden');
    return;
  }

  document.getElementById('add-success-text').textContent = `User "${username}" added successfully!`;
  successDiv.classList.remove('hidden');
  document.getElementById('add-user-form').reset();
  loadUsersTable();
}

function handleDeleteUser(username) {
  if (!confirm(`Delete user "${username}"?\n\nThis action cannot be undone.`)) {
    return;
  }
  removeLocalUser(username);
  loadUsersTable();
}

async function generateHash() {
  const input = document.getElementById('hash-input').value;
  if (!input) {
    alert('Please enter a password first!');
    return;
  }
  const hash = await hashPassword(input);
  document.getElementById('hash-output').value = hash;
  document.getElementById('hash-result').classList.remove('hidden');
}

function copyHash() {
  const hashOutput = document.getElementById('hash-output');
  hashOutput.select();
  navigator.clipboard.writeText(hashOutput.value).then(() => {
    const btn = document.querySelector('#hash-result button');
    const origText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = origText, 1500);
  });
}

loadUsersTable();
