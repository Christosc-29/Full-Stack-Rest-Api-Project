// ==============================
// 👤 User Management Page Logic
// ==============================

window.onload = loadUserList;

// Load all users from backend
function loadUserList() {
  fetch('/api/users/all')
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById('user-list');
      ul.innerHTML = '';
      data.forEach(u => drawUser(u.id, u.username));
    });
}

// Render one user row
function drawUser(uid, uname) {
  const li = document.createElement('li');
  li.style.marginBottom = '0.5em';
  li.id = `user-${uid}`;

  li.innerHTML = `
    <strong>ID:</strong> ${uid}, <strong>Username:</strong> ${uname}
    <button id="btn-change-${uid}" onclick="showPassField(${uid}, '${uname}')" style="margin-left: 2em;">🔑 Change</button>
  `;

  document.getElementById('user-list').appendChild(li);
}

// Show input to enter new password
function showPassField(uid, uname) {
  const li = document.getElementById(`user-${uid}`);
  li.innerHTML = `
    <strong>ID:</strong> ${uid}, <strong>Username:</strong> ${uname}
    <input type="password" id="pass-${uid}" maxlength="14" style="margin-left: 1em; max-width: 140px;">
    <button onclick="submitPass(${uid}, '${uname}')" style="margin-left: 0.5em;">💾 Save</button>
    <button onclick="cancelEdit(${uid}, '${uname}')" style="margin-left: 0.5em;">❌ Cancel</button>
  `;
}

// Cancel password change
function cancelEdit(uid, uname) {
  const li = document.getElementById(`user-${uid}`);
  li.innerHTML = `
    <strong>ID:</strong> ${uid}, <strong>Username:</strong> ${uname}
    <button id="btn-change-${uid}" onclick="showPassField(${uid}, '${uname}')" style="margin-left: 2em;">🔑 Change</button>
  `;
}

// Send password update
function submitPass(uid, uname) {
  const newPass = document.getElementById(`pass-${uid}`).value;
  if (!newPass) {
    alert("⚠️ Please enter a new password.");
    return;
  }

  fetch(`/api/users/${uid}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: newPass })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "✅ Password updated.");
      cancelEdit(uid, uname);
    });
}

// Add a new user
function addUser() {
  const uname = document.getElementById("new-username").value;
  const pass = document.getElementById("new-password").value;

  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: uname, password: pass })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "✅ User added.");
      loadUserList();
    });
}

// Delete user by ID (from input or param)
function deleteUser(uid = null) {
  if (!uid) uid = document.getElementById("delete-user-id").value;
  if (!uid) {
    alert("❗ Please enter a User ID to delete.");
    return;
  }

  const confirmDel = confirm(`⚠️ Are you sure you want to delete user ID ${uid}?`);
  if (!confirmDel) return;

  fetch(`/api/users/${uid}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: "Y" })
  })
    .then(async res => {
      const result = await res.json();
      if (res.ok) {
        alert(result.message || "✅ User deleted.");
        loadUserList();
      } else {
        alert(result.error || "❌ Failed to delete user.");
      }
    })
    .catch(err => {
      alert("❌ An unexpected error occurred.");
      console.error(err);
    });
}

// Navigation shortcuts
function goToHome() {
  window.location.href = "/home";
}

function goToAdmin() {
  window.location.href = "/admin";
}
