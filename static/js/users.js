window.onload = loadUsers;

function loadUsers() {
  fetch('/api/users/all')
    .then(res => res.json())
    .then(users => {
      const list = document.getElementById('user-list');
      list.innerHTML = '';

      users.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>ID:</strong> ${user.id}, <strong>Username:</strong> ${user.username}
          <input type="password" placeholder="New Password" id="new-pass-${user.id}">
          <button onclick="changePassword(${user.id})">🔑 Change</button>
        `;
        list.appendChild(li);
      });
    });
}

function changePassword(id) {
  const newPass = document.getElementById(`new-pass-${id}`).value;

  if (!newPass) {
    alert("⚠️ Enter a new password");
    return;
  }

  fetch(`/api/users/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: newPass })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message || "Password changed!");
    document.getElementById(`new-pass-${id}`).value = '';
  });
}


function addUser() {
  const username = document.getElementById("new-username").value;
  const password = document.getElementById("new-password").value;

  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message || "User added!");
    loadUsers();
  });
}

function deleteUser() {
  const id = document.getElementById("delete-user-id").value;

  fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: "Y" })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message || "User deleted!");
    loadUsers();
  });
}

function goToHome() {
  window.location.href = "/home";
}

function goToAdmin() {
  window.location.href = "/admin";
}
