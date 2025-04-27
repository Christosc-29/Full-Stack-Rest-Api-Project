// ===============================
// 👤 User Management Page Logic
// ===============================

// ➡️ When the page loads, fetch all users and display them
window.onload = loadUsers;

// Function: Load users from the server and display in a list
function loadUsers() {
  fetch('/api/users/all')
    .then(res => res.json())
    .then(users => {
      const list = document.getElementById('user-list');
      list.innerHTML = ''; // Clear current list

      users.forEach(user => {
        // Create a list item for each user with Change Password option
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

// ➡️ Change the password of a specific user
function changePassword(id) {
  const newPass = document.getElementById(`new-pass-${id}`).value;

  if (!newPass) {
    alert("⚠️ Please enter a new password.");
    return;
  }

  // Send new password to the server
  fetch(`/api/users/${id}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: newPass })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message || "Password changed!");
    document.getElementById(`new-pass-${id}`).value = ''; // Clear the input after success
  });
}

// ➡️ Add a new user with username and password
function addUser() {
  const username = document.getElementById("new-username").value;
  const password = document.getElementById("new-password").value;

  // Send new user data to the server
  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message || "User added!");
    loadUsers(); // Reload the updated user list
  });
}

// ➡️ Delete a user by ID (with confirmation popup)
function deleteUser(userId = null) {
  // If no ID passed manually, try getting from input field
  if (!userId) {
    userId = document.getElementById("delete-user-id").value;
  }

  if (!userId) {
    alert("❗ Please enter a User ID to delete.");
    return;
  }

  const confirmDelete = confirm(`⚠️ Are you sure you want to delete user ID ${userId}?`);
  if (!confirmDelete) return;

  // Send delete request to server
  fetch(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: "Y" })
  })
  .then(async res => {
    const data = await res.json();
    if (res.ok) {
      alert(data.message || "✅ User deleted.");
      loadUsers(); // Reload updated user list after deletion
    } else {
      alert(data.error || "❌ Failed to delete user.");
    }
  })
  .catch(err => {
    alert("❌ An unexpected error occurred.");
    console.error(err);
  });
}

// ===============================
// 🚀 Navigation Functions
// ===============================

// ➡️ Go to the Home page
function goToHome() {
  window.location.href = "/home";
}

// ➡️ Go to the Admin panel
function goToAdmin() {
  window.location.href = "/admin";
}
