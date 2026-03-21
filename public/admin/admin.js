const BASE_URL = "http://localhost:5000";

const form = document.getElementById("productForm");
const table = document.getElementById("productTable");
const preview = document.getElementById("preview");
const previewText = document.getElementById("previewText");
const productCount = document.getElementById("productCount");
const btnText = document.getElementById("btnText");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");
const imageInput = document.getElementById("image");

let editId = null;

// Image preview on file selection
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    previewText.style.display = "none";
  }
});

// Form submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validation
  if (!nameInput.value.trim()) {
    alert("Please enter product name!");
    return;
  }

  if (!priceInput.value) {
    alert("Please enter price!");
    return;
  }

  if (!categoryInput.value) {
    alert("Please select category!");
    return;
  }

  if (!imageInput.files[0] && !editId) {
    alert("Please select an image!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", nameInput.value.trim());
    formData.append("price", priceInput.value);
    formData.append("category", categoryInput.value);

    if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    btnText.textContent = editId ? "Updating..." : "Uploading...";
    btnText.parentElement.disabled = true;

    let url = `${BASE_URL}/products/upload`;
    let method = "POST";

    if (editId) {
      url = `${BASE_URL}/products/${editId}`;
      method = "PUT";
    }

    console.log(`Making ${method} request to ${url}`);

    const res = await fetch(url, {
      method: method,
      body: formData
    });

    const data = await res.json();
    console.log("Response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to save product");
    }

    alert(data.message || (editId ? "Product updated!" : "Product uploaded!"));

    form.reset();
    preview.src = "";
    previewText.style.display = "block";
    editId = null;
    btnText.textContent = "Upload Product";
    btnText.parentElement.disabled = false;

    loadProducts();
  } catch (err) {
    console.error("Error:", err);
    alert(`Error: ${err.message}`);
    btnText.textContent = "Upload Product";
    btnText.parentElement.disabled = false;
  }
});

// Load all products
async function loadProducts() {
  try {
    console.log("Loading products from:", `${BASE_URL}/products`);
    const res = await fetch(`${BASE_URL}/products`);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const products = await res.json();
    console.log("Products loaded:", products);

    table.innerHTML = "";
    
    if (!products || products.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-8 text-gray-500">
            <i class="fas fa-inbox mr-2"></i>No products found. Add your first product!
          </td>
        </tr>
      `;
      productCount.textContent = "0";
      return;
    }

    products.forEach((p, index) => {
      const imageUrl = p.imageUrl || p.image_url || "https://via.placeholder.com/70";
      table.innerHTML += `
        <tr class="table-row border-b border-gray-100">
          <td class="px-4 py-4 text-gray-900 font-semibold">${p.id}</td>
          <td class="px-4 py-4">
            <img src="${imageUrl}" alt="${p.name}" width="70" height="70" class="rounded object-cover">
          </td>
          <td class="px-4 py-4 text-gray-900 font-semibold">${p.name}</td>
          <td class="px-4 py-4 text-gray-900 font-semibold">₹${parseFloat(p.price).toFixed(2)}</td>
          <td class="px-4 py-4 text-gray-700">
            <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
              ${p.category}
            </span>
          </td>
          <td class="px-4 py-4 space-x-2">
            <button onclick="editProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.category}')"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition">
              <i class="fas fa-edit mr-1"></i>Edit
            </button>
            <button onclick="deleteProduct(${p.id})"
              class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition">
              <i class="fas fa-trash mr-1"></i>Delete
            </button>
          </td>
        </tr>
      `;
    });

    productCount.textContent = products.length;
  } catch (err) {
    console.error("Failed to load products:", err);
    table.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-8 text-red-500">
          <i class="fas fa-exclamation-circle mr-2"></i>Failed to load products. Check console for details.
        </td>
      </tr>
    `;
  }
}

// Delete product
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to delete product");
    }

    alert(data.message || "Product deleted!");
    loadProducts();
  } catch (err) {
    console.error("Error:", err);
    alert(`Error: ${err.message}`);
  }
}

// Edit product
function editProduct(id, name, price, category) {
  editId = id;
  nameInput.value = name;
  priceInput.value = price;
  categoryInput.value = category;

  btnText.textContent = "Update Product";
  window.scrollTo({ top: 0, behavior: "smooth" });
  nameInput.focus();
}

// Load products on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, loading products...");
  loadProducts();
});
