const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch(`/api/products/${id}`)
  .then(res => res.json())
  .then(product => {
    if (product.error) {
      document.body.innerHTML = `<h2>❌ Product not found.</h2><a href="/home">← Back</a>`;
      return;
    }

    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-id").textContent = product.id;
    document.getElementById("product-price").textContent = product.price;
    document.getElementById("product-stock").textContent = product.stock;
    document.getElementById("product-details").textContent = product.details;
    document.getElementById("product-image").src = product.image_url || "https://via.placeholder.com/300";
  })
  .catch(err => {
    console.error("Error loading product:", err);
    document.body.innerHTML = `<h2>⚠️ Error loading product.</h2><a href="/home">← Back</a>`;
  });
