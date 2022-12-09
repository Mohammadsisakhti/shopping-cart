import { productsData } from "./products.js";

const modalCart = document.querySelector(".modal-cart");
const backdrop = document.querySelector(".backdrop");
const cartIcon = document.querySelector(".head-cart");

const productsContainer = document.querySelector(".products-container");
const totalPrice = document.querySelector(".total-price-price");
const totalItem = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-btn");
const searchInput = document.querySelector(".search-input ");

// To make the variable global
let buttonsDOM = [];

// Create empty cart
let cart = [];

const filters = {
  searchItem: "",
};

// Get products from list
class Products {
  getProducts() {
    return productsData;
  }
}

// Display products on the site
class UI {
  // Show products on the main page
  showProducts(products, filter) {
    const filteredProducts = products.filter((p) => {
      return p.title.toLowerCase().includes(filter.toLowerCase());
    });
    productsContainer.innerHTML = "";
    filteredProducts.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("product");
      div.innerHTML = `
      <img
      src=${item.imageUrl}
      alt="Product Image"
      class="product-image"
      />
      <div class="product-disc">
      <p class="product-price">${item.price} $</p>
      <p>${item.title}</p>
      </div>
      <div class="product-add-cart">
      <button class="add-to-cart" data-id=${item.id} >Add To Cart</button>
      </div>
      `;
      productsContainer.appendChild(div);
    });
  }

  // Detect which button is clicked add to cart
  getAddCartBtns() {
    const addToCartBtn = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = addToCartBtn;

    addToCartBtn.forEach((btn) => {
      const id = btn.dataset.id;

      // Check button clicked
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.classList.add("in-cart-btn");
        btn.disabled = true;
      }

      btn.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.classList.add("in-cart-btn");
        e.target.disabled = true;

        // Add selected products to cart
        const addedProduct = { ...Storage.getProducts(id), quantity: 1 };
        cart = [...cart, addedProduct];

        // Update storage & cart Value
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(addedProduct);
      });
    });
  }

  // Shopping cart calculation
  setCartValue(cart) {
    let tempCount = 0;
    const entire = cart.reduce((acc, curr) => {
      tempCount += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);

    // Show on the cart
    totalPrice.innerText = `${entire.toFixed(2)} $`;
    totalItem.innerText = tempCount;
  }

  // Show Products on the Cart
  addCartItem(products) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img
    class="cart-image"
    src=${products.imageUrl}
    alt="Cart Images"
  />
  <div class="cart-product-disc">
    <p class="product-title">${products.title}</p>
    <p class="product-price">${products.price} $</p>
  </div>
  <div class="cart-quantity">
    <i class="fa-solid fa-chevron-up" data-id=${products.id} ></i>
    <p>${products.quantity}</p>
    <i class="fa-solid fa-chevron-down" data-id=${products.id} ></i>
  </div>
  <div class="cart-trsh">
  <i class="fa-regular fa-trash-can" data-id=${products.id} ></i>
    </div>`;
    cartContent.appendChild(div);
  }

  // Initial cart loading
  setup() {
    cart = Storage.getCart() || [];

    // Add Propducts to cart from storage
    cart.forEach((ci) => {
      this.addCartItem(ci);
      this.setCartValue(cart);
    });
  }

  // Remove products from cart
  logicCart() {
    // Delete all items
    clearCart.addEventListener("click", () => {
      this.clearCart();
    });

    // Delete selected items
    cartContent.addEventListener("click", (e) => {
      this.calc(e);
    });
  }

  // Remove items from cart
  removeItem(id) {
    cart = cart.filter((cItem) => cItem.id !== parseInt(id));
    this.setCartValue(cart);
    Storage.saveCart(cart);
    this.previousButton(id);
  }

  // Increase and decrease the count
  calc(e) {
    // Click on the trash icon
    if (e.target.classList.contains("fa-trash-can")) {
      const removeItem = e.target;
      const remove = cart.find((p) => p.id === parseInt(removeItem.dataset.id));
      this.removeItem(remove.id);
      cartContent.removeChild(removeItem.parentElement.parentElement);
    }
    // Click on the up chevron
    else if (e.target.classList.contains("fa-chevron-up")) {
      const addQuantity = e.target;
      const add = cart.find((p) => p.id === parseInt(addQuantity.dataset.id));
      add.quantity++;

      this.setCartValue(cart);
      Storage.saveCart(cart);

      addQuantity.nextElementSibling.innerText = add.quantity;
    }
    // Click on the down chevron
    else if (e.target.classList.contains("fa-chevron-down")) {
      const removeQuantity = e.target;
      const remove = cart.find(
        (p) => p.id === parseInt(removeQuantity.dataset.id)
      );
      remove.quantity--;

      this.setCartValue(cart);
      Storage.saveCart(cart);

      removeQuantity.previousElementSibling.innerText = remove.quantity;

      // When the number goes below one
      if (remove.quantity < 0) {
        const removeItem = e.target;
        const remove = cart.find(
          (p) => p.id === parseInt(removeItem.dataset.id)
        );
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(remove.id);
      }
    }
  }

  // Delete all items on cart
  clearCart() {
    cart.forEach((cItem) => this.removeItem(cItem.id));

    // Remove item on the DOM
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModal();
  }

  // previous button to 'Add To Cart'
  previousButton(id) {
    const button = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "Add To Cart";
    button.classList.remove("in-cart-btn");
    button.disabled = false;
  }
}

// Local storage
class Storage {
  // Save products from list
  static saveProduct(product) {
    localStorage.setItem("products", JSON.stringify(product));
  }

  // Get products from local storage
  static getProducts(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }

  // Save cart from list
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Get cart from local storage
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

// Open cart modal
function openModal() {
  modalCart.style.opacity = "1";
  modalCart.style.top = "15%";
  backdrop.style.display = "block";
}

// Close cart modal
function closeModal() {
  modalCart.style.opacity = "0";
  modalCart.style.top = "-350%";
  backdrop.style.display = "none";
}

// Run when the site loads
document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();
  const ui = new UI();
  ui.showProducts(productsData, filters.searchItem);
  ui.setup();
  ui.getAddCartBtns();
  ui.logicCart();

  Storage.saveProduct(productsData);
});

cartIcon.addEventListener("click", openModal);

backdrop.addEventListener("click", closeModal);

// Search input event
searchInput.addEventListener("input", (e) => {
  const products = new Products();
  const productsData = products.getProducts();
  const ui = new UI();

  // Search input value
  filters.searchItem = e.target.value;

  // Return value to show product to main page
  ui.showProducts(productsData, filters.searchItem);
  ui.getAddCartBtns();
});
