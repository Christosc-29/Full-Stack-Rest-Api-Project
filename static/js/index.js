// =========================
// 📦 Index Page Script
// =========================

let products = []; // Stores all product data for filtering

// Fetch product list from backend and draw on page
function loadProducts() {
  fetch("/api/products")
    .then(res => res.json())
    .then(data => {
      products = data;
      drawProducts();
    });
}

// Filter products based on search box input
function filter() {
  const query = document.getElementById("inputSearch").value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) || p.id.toString().includes(query)
  );
  drawProducts(filtered);
}

// Create and display product cards
function drawProducts(list = products) {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <h3>${p.name}</h3>
      <p><strong>💰 Price:</strong> €${p.price}</p>
      <p><strong>📦 Stock:</strong> ${p.stock}</p>
      <button onclick="goToProduct(${p.id})">🔍 View</button>
      <button onclick="editProduct(${p.id})" style="margin-left: 0.5em; display: ${localStorage.getItem("isLoggedIn") === "true" ? 'inline-block' : 'none'}">✏️ Edit</button>
    `;

    container.appendChild(card);
  });
}

// Navigate to product details
function goToProduct(id) {
  window.location.href = `/product?id=${id}`;
}

// Store product ID and go to admin page for editing
function editProduct(id) {
  localStorage.setItem("editProductId", id);
  window.location.href = "/admin";
}

// Attempt login and show/hide UI buttons accordingly
function login() {
  const username = document.getElementById("inputUser").value;
  const password = document.getElementById("inputPass").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        localStorage.setItem("isLoggedIn", "true");
        updateAuthUI();
      } else {
        alert(data.error || "Login failed");
      }
    });
}

// Logout user and update UI
function logout() {
  localStorage.removeItem("isLoggedIn");
  fetch("/logout")
    .then(() => {
      alert("👋 Logged out.");
      window.location.href = "/home";
    });
}


// Redirect to admin panel
function goToAdmin() {
  window.location.href = "/admin";
}

// Toggle login/logout visibility
function updateAuthUI() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  document.getElementById("login-button").style.display = isLoggedIn ? "none" : "inline-block";
  document.getElementById("btnAdmin").style.display = isLoggedIn ? "inline-block" : "none";
  document.getElementById("btnLogout").style.display = isLoggedIn ? "inline-block" : "none";
}

// Initial setup on load
window.onload = () => {
  loadProducts();
  updateAuthUI();
  document.getElementById("inputSearch").addEventListener("input", filter);
};
