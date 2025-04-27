// =========================
// 📦 Product Loading Functions
// =========================

// ➡️ Fetch all products from backend and display them
function refreshProducts() {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      displayProducts(data);
    });
}

// ➡️ Render the list of products on the home page
function displayProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';

  products.forEach(product => {
    const image = product.image_url || "https://via.placeholder.com/150"; // Placeholder if no image

    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p><strong>ID:</strong> ${product.id}</p>
      <p>Price: €${product.price}</p>
      <p>Stock: ${product.stock}</p>
      <a href="/product?id=${product.id}">🔍 View</a>
    `;
    list.appendChild(div);
  });
}

// Store all loaded products globally
let allProducts = [];

// =========================
// 🔍 Product Filtering
// =========================

// ➡️ Filter displayed products by name or ID
function filterProducts() {
  const query = document.getElementById('search-box').value.toLowerCase();

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.id.toString().includes(query)
  );

  displayProducts(filtered);
}

// =========================
// 🔐 Login Logic
// =========================

// ➡️ Attempt login based on username/password fields
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch('/api/users')
    .then(res => res.json())
    .then(users => {
      const valid = users.find(u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
      );

      if (valid) {
        alert("✅ Login successful!");
        document.getElementById("admin-button").style.display = "inline-block";
      } else {
        alert("❌ Invalid credentials");
      }
    });
}

// =========================
// 🚀 Page Navigation
// =========================

// ➡️ Navigate to Admin page
function goToAdmin() {
  window.location.href = "/admin";
}

// Initial load of products when page loads
refreshProducts();
