// const form = document.getElementById("productForm");
// const table = document.getElementById("productTable");
// const BASE_URL = "http://localhost:5000";

// // Upload product
// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const formData = new FormData();
//   formData.append("name", name.value);
//   formData.append("price", price.value);
//   formData.append("category", category.value);
//   formData.append("image", image.files[0]);

//   const res = await fetch(`${BASE_URL}/Products/upload`, {
//     method: "POST",
//     body: formData
//   });

//   const data = await res.json();
//   alert(data.message || "Uploaded");
//   loadProducts();
//   form.reset();
// });

// // Load products
// async function loadProducts() {
//   const res = await fetch(`${BASE_URL}/products`);
//   const products = await res.json();

//   table.innerHTML = "";
//   products.forEach(p => {
//     table.innerHTML += `
//       <tr>
//         <td>${p.id}</td>
//         <td>${p.name}</td>
//         <td>${p.price}</td>
//         <td>${p.category}</td>
//         <td><img src="${p.image_url}" width="70"/></td>
//       </tr>
//     `;
//   });
// }

// loadProducts();
// const BASE_URL = "http://localhost:5000";

// const form = document.getElementById("productForm");
// const table = document.getElementById("productTable");
// const preview = document.getElementById("preview");

// const nameInput = document.getElementById("name");
// const priceInput = document.getElementById("price");
// const categoryInput = document.getElementById("category");
// const imageInput = document.getElementById("image");

// let editId = null; // kis product ko edit kar rahe

// // Image preview
// imageInput.addEventListener("change", () => {
//   const file = imageInput.files[0];
//   if (file) preview.src = URL.createObjectURL(file);
// });

// // Add / Update product
// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const formData = new FormData();
//   formData.append("name", nameInput.value);
//   formData.append("price", priceInput.value);
//   formData.append("category", categoryInput.value);

//   if (imageInput.files[0]) {
//     formData.append("image", imageInput.files[0]);
//   }

//   let url = `${BASE_URL}/products/upload`;
//   let method = "POST";

//   if (editId) {
//     url = `${BASE_URL}/products/${editId}`;
//     method = "PUT";   // update API
//   }

//   const res = await fetch(url, {
//     method: method,
//     body: formData
//   });

//   const data = await res.json();
//   alert(data.message || "Success");

//   form.reset();
//   preview.src = "";
//   editId = null;

//   loadProducts();
// });

// // Load products
// async function loadProducts() {
//   const res = await fetch(`${BASE_URL}/products`);
//   const products = await res.json();

//   table.innerHTML = "";
//   products.forEach(p => {
//     table.innerHTML += `
//       <tr>
//         <td>${p.id}</td>
//         <td><img src="${p.imageUrl || p.image_url}" width="70"></td>
//         <td>${p.name}</td>
//         <td>₹${p.price}</td>
//         <td>${p.category}</td>
//         <td class="space-x-2">
//           <button onclick="editProduct(${p.id}, '${p.name}', ${p.price}, '${p.category}')"
//             class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>

//           <button onclick="deleteProduct(${p.id})"
//             class="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
//         </td>
//       </tr>
//     `;
//   });
// }

// // Delete product
// async function deleteProduct(id) {
//   if (!confirm("Delete this product?")) return;

//   const res = await fetch(`${BASE_URL}/products/${id}`, {
//     method: "DELETE"
//   });

//   const data = await res.json();
//   alert(data.message || "Deleted");

//   loadProducts();
// }

// // Edit product (fill form)
// function editProduct(id, name, price, category) {
//   editId = id;
//   nameInput.value = name;
//   priceInput.value = price;
//   categoryInput.value = category;

//   window.scrollTo({ top: 0, behavior: "smooth" });
// }

// loadProducts();
const BASE_URL = "http://localhost:5000";

const form = document.getElementById("productForm");
const table = document.getElementById("productTable");
const preview = document.getElementById("preview");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");
const imageInput = document.getElementById("image");

let editId = null; // kis product ko edit kar rahe

// Image preview
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) preview.src = URL.createObjectURL(file);
});

// Add / Update product
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", nameInput.value);
  formData.append("price", priceInput.value);
  formData.append("category", categoryInput.value);

  if (imageInput.files[0]) {
    formData.append("image", imageInput.files[0]);
  }

  let url = `${BASE_URL}/products/upload`;
  let method = "POST";

  if (editId) {
    url = `${BASE_URL}/products/${editId}`;
    method = "PUT";
  }

  try {
    const res = await fetch(url, {
      method,
      body: formData
    });

    const data = await res.json();
    alert(data.message || "Success");

    form.reset();
    preview.src = "";
    editId = null;

    loadProducts();
  } catch (err) {
    console.error(err);
    alert("Something went wrong!");
  }
});

// Load products
async function loadProducts() {
  try {
    const res = await fetch(`${BASE_URL}/products`);
    const products = await res.json();

    table.innerHTML = "";
    products.forEach(p => {
      table.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td><img src="${p.imageUrl || p.image_url}" width="70"></td>
          <td>${p.name}</td>
          <td>₹${p.price}</td>
          <td>${p.category}</td>
          <td class="space-x-2">
            <button onclick="editProduct(${p.id}, '${p.name}', ${p.price}, '${p.category}')"
              class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>

            <button onclick="deleteProduct(${p.id})"
              class="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load products");
  }
}

// Delete product
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();
    alert(data.message || "Deleted");

    loadProducts();
  } catch (err) {
    console.error(err);
    alert("Failed to delete product");
  }
}

// Edit product (fill form)
function editProduct(id, name, price, category) {
  editId = id;
  nameInput.value = name;
  priceInput.value = price;
  categoryInput.value = category;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

loadProducts();
