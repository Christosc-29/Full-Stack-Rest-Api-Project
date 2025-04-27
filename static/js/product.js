// ==============================
// 📄 Product Details Page Logic
// ==============================

// ➡️ Parse URL parameters to get product ID
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// ➡️ Fetch the product details from backend
fetch(`/api/products/${id}`)
  .then(res => res.json())
  .then(product => {
    if (product.error) {
      // If the product is not found, display an error message
      document.body.innerHTML = `<h2>❌ Product not found.</h2><a href="/home">← Back</a>`;
      return;
    }

    // ➡️ If product found, fill the HTML elements with product info
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-id").textContent = product.id;
    document.getElementById("product-price").textContent = product.price;
    document.getElementById("product-stock").textContent = product.stock;
    document.getElementById("product-details").textContent = product.details;
    document.getElementById("product-image").src = product.image_url || "https://via.placeholder.com/300";
  })
  .catch(err => {
    // ➡️ If there was a server error, display a general error message
    console.error("Error loading product:", err);
    document.body.innerHTML = `<h2>⚠️ Error loading product.</h2><a href="/home">← Back</a>`;
  });
