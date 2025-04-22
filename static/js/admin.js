function addBulkRow() {
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
    addBulkRow(); // Reset with 1 row for convenience
  });
}

// ------------------ Edit / Delete / Navigation (unchanged) ------------------

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
    .then(msg => {
      alert(msg.message || "Product deleted.");
    });
  } else if (name) {
    fetch(`/api/products/name/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: "Y" })
    })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message || "Product deleted.");
    });
  } else {
    alert("❗ Please enter either a Product ID or Name to delete.");
  }
}

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
    .then(res => res.json())
    .then(msg => {
      alert(msg.message || "Product updated!");
    });
}

function goToHome() {
  window.location.href = "/home";
}

function goToUsers() {
  window.location.href = "/users";
}
