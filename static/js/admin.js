
// ===================================================
// 📦 Bulk Product Management
// ===================================================

// ➡️ Add a new empty row to the Bulk Add table
function addBulkRow() {
  const table = document.querySelector('#bulk-table tbody');
  const row = document.createElement('tr');
  console.log("✅ admin.js loaded!");

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

// ➡️ Collect all rows and submit them as bulk products
function submitBulkProducts() {
  const rows = document.querySelectorAll('#bulk-table tbody tr');
  const products = [];

  rows.forEach(row => {
    const name = row.querySelector('.bulk-name').value;
    const price = parseFloat(row.querySelector('.bulk-price').value);
    const stock = parseInt(row.querySelector('.bulk-stock').value);
    const details = row.querySelector('.bulk-details').value;
    const image_url = row.querySelector('.bulk-image-url').value;

    if (name && !isNaN(price) && !isNaN(stock)) {
      products.push({ name, price, stock, details, image_url });
    }
  });

  if (products.length === 0) {
    alert("❗ Please fill out at least one valid product row.");
    return;
  }

  fetch('/api/products/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message || "Products added!");
    document.querySelector('#bulk-table tbody').innerHTML = '';
    addBulkRow();
  });
}

// ===================================================
// 🗑️ Single or Bulk Deletion Functions
// ===================================================

// ➡️ Smart delete by ID or Name
function smartDelete() {
  const id = document.getElementById("delete-id").value;
  const name = document.getElementById("delete-name").value;
  console.log("🧪 Running updated smartDelete");

  if (id) {
    fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: "Y" })
    })
    .then(async res => {
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "✅ Product deleted!");
      } else {
        alert(data.error || "❌ Failed: " + data.error);
      }
    });
  } else if (name) {
    fetch(`/api/products/name/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: "Y" })
    })
    .then(async res => {
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "✅ Product deleted!");
      } else {
        alert(data.error || "❌ Failed: " + data.error);
      }
    });
  } else {
    alert("❗ Please enter either a Product ID or Name to delete.");
  }
}

// ➡️ Delete ALL products after confirmation
function deleteAllProducts() {
  const confirmDelete = confirm("⚠️ You are about to delete ALL products. Are you sure?");
  if (!confirmDelete) return;

  fetch(`/api/products/all`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: "Y" })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message || "All products deleted.");
  });
}

// ===================================================
// ✏️ Editing Products
// ===================================================

// ➡️ Edit an existing product by ID
function editProduct() {
  const id = document.getElementById("edit-id").value;

  const updatedData = {
    name: document.getElementById("edit-name").value,
    price: parseFloat(document.getElementById("edit-price").value),
    stock: parseInt(document.getElementById("edit-stock").value),
    details: document.getElementById("edit-details").value,
    image_url: document.getElementById("edit-image-url").value
  };

  fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData)
  })
  .then(async res => {
    const data = await res.json();
    if (res.ok) {
      alert(data.message || `✅ Product ID ${id} updated successfully.`);
    } else {
      alert(data.error || `❌ Failed to update product ID \${id}.`);
    }
  });
}

// ===================================================
// 🚪 Page Navigation
// ===================================================

// ➡️ Navigate back to Home page
function goToHome() {
  window.location.href = "/home";
}

// ➡️ Navigate to Users management page
function goToUsers() {
  window.location.href = "/users";
}
