// ==============================
// ✅ Admin Panel Functions
// ==============================

// Add new row to bulk input table
function addRow() {
  const table = document.querySelector('#bulk-table tbody');
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><input type="text" class="bulk-name"></td>
    <td><input type="number" class="bulk-price" step="0.01"></td>
    <td><input type="number" class="bulk-stock"></td>
    <td><input type="text" class="bulk-details"></td>
    <td><input type="text" class="bulk-image-url"></td>
    <td><button onclick="this.closest('tr').remove()">❌</button></td>
  `;

  table.appendChild(row);
}

// Send all entered product rows to backend
function sendBulk() {
  const rows = document.querySelectorAll('#bulk-table tbody tr');
  const list = [];

  rows.forEach(row => {
    const name = row.querySelector('.bulk-name').value;
    const price = parseFloat(row.querySelector('.bulk-price').value);
    const stock = parseInt(row.querySelector('.bulk-stock').value);
    const details = row.querySelector('.bulk-details').value;
    const image = row.querySelector('.bulk-image-url').value;

    if (name && !isNaN(price) && !isNaN(stock)) {
      list.push({ name, price, stock, details, image_url: image });
    }
  });

  if (list.length === 0) {
    alert("❗ Please fill at least one valid product row.");
    return;
  }

  fetch('/api/products/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products: list })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message || "✅ Products added!");
    document.querySelector('#bulk-table tbody').innerHTML = '';
    addRow();
  });
}

// Delete product by ID or Name
function smartDelete() {
  const id = document.getElementById("delete-id").value;
  const name = document.getElementById("delete-name").value;

  if (id) {
    fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: "Y" })
    })
    .then(res => res.json())
    .then(data => alert(data.message || data.error));
  } else if (name) {
    fetch(`/api/products/name/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: "Y" })
    })
    .then(res => res.json())
    .then(data => alert(data.message || data.error));
  } else {
    alert("❗ Enter ID or Name to delete.");
  }
}

// Remove all products
function nukeAll() {
  if (!confirm("⚠️ Delete ALL products?")) return;

  fetch(`/api/products/all`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: "Y" })
  })
  .then(res => res.json())
  .then(data => alert(data.message || "All products deleted."));
}

// Submit product edits to backend
function updateProduct() {
  const id = document.getElementById("edit-id").value;
  const data = {
    name: document.getElementById("edit-name").value,
    price: parseFloat(document.getElementById("edit-price").value),
    stock: parseInt(document.getElementById("edit-stock").value),
    details: document.getElementById("edit-details").value,
    image_url: document.getElementById("edit-image-url").value
  };

  fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(data => alert(data.message || data.error));
}

// Prefill form if redirected with edit ID
window.addEventListener("DOMContentLoaded", () => {
  const editId = localStorage.getItem("editProductId");
  if (editId) {
    fetch(`/api/products/${editId}`)
      .then(res => res.json())
      .then(p => {
        document.getElementById("edit-id").value = p.id;
        document.getElementById("edit-name").value = p.name;
        document.getElementById("edit-price").value = p.price;
        document.getElementById("edit-stock").value = p.stock;
        document.getElementById("edit-details").value = p.details;
        document.getElementById("edit-image-url").value = p.image_url;
        localStorage.removeItem("editProductId");
      });
  }
});

// Navigation and logout
function goToHome() {
  window.location.href = "/home";
}

function goToUsers() {
  window.location.href = "/users";
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  fetch("/logout")
    .then(() => {
      alert("👋 Logged out.");
      window.location.href = "/home";
    });
}
