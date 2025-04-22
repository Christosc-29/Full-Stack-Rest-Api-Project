let allProducts = [];

function refreshProducts() {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      displayProducts(data);
    });
}

function displayProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';

  products.forEach(product => {
    const image = product.image_url || "https://via.placeholder.com/150";

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

function filterProducts() {
  const query = document.getElementById('search-box').value.toLowerCase();

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.id.toString().includes(query)
  );

  displayProducts(filtered);
}


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

function goToAdmin() {
  window.location.href = "/admin";
}

refreshProducts();
