// const { response } = require("express");

// reloda the page
if (performance.navigation.type === performance.navigation.TYPE_RELOAD || performance.getEntriesByType('navigation')[0]?.type === 'reload') {
  // clear cart
  sessionStorage.clear()
}

const yearSpan = document.getElementById('currentYear');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Add Product Form Handler
const addProductForm = document.getElementById("addProductForm");
const productModal = document.getElementById("productModal");
const adminProductsTable = document.getElementById("adminProductsTable");
const addOfferForm = document.getElementById('addOfferForm');
const adminOffersTable = document.getElementById('adminOffersTable');
const offerModal = document.getElementById('offerModal');
const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotaAmount = document.getElementById('cartTotalAmount');
const checkOutBtn = document.getElementById('checkOutBtn');
const btnWhatsapp = document.getElementById('btnWhatsapp');
const eventModal = document.getElementById('eventModal');
const eventOrderForm = document.getElementById('eventOrderForm');
const adminEventOrderTable = document.getElementById('adminEventOrderTable');

// Add product modal
document.getElementById("openAddProductBtn")?.addEventListener("click", () => productModal?.classList.add("open"));
document.getElementById("closeProdModal")?.addEventListener("click", () => productModal?.classList.remove("open"));
document.getElementById('eventCloseModalBtn')?.addEventListener("click", () => eventModal?.classList.add('hidden'))
document.getElementById('openEventBtnModal')?.addEventListener("click", () => eventModal?.classList.remove('hidden'))

document.addEventListener('DOMContentLoaded', () => {
  const registerScreen = document.getElementById('registerScreen');
  const loginScreen = document.getElementById('loginScreen');
  const resetScreen = document.getElementById('resetScreen');
  const adminDashboard = document.getElementById('adminDashboard');

  registerScreen?.classList.remove('hidden');
  loginScreen?.classList.add('hidden');
  resetScreen?.classList.add('hidden');
  adminDashboard?.classList.add('hidden');

  document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    registerScreen?.classList.add('hidden');
    loginScreen?.classList.remove('hidden');
  });

  document.getElementById('showReset')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginScreen?.classList.add('hidden');
    resetScreen?.classList.remove('hidden');
  });

  document.getElementById('backToLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    resetScreen?.classList.add('hidden');
    loginScreen?.classList.remove('hidden')
  })
});

// functiion handle owner registeration
document.getElementById('registerForm')?.addEventListener('submit', async(e) => {
  e.preventDefault();

  const name = document.getElementById('reqUserName')?.value;
  const email = document.getElementById('adminEmail')?.value;
  const password = document.getElementById('adminPass')?.value;
  const regSecretPhrase = document.getElementById('regSecretPhrase')?.value;

  try{
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({
        name : name,
        email : email, 
        password : password,
        regSecretPhrase : regSecretPhrase})
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message + 'Please Log in');
      registerScreen.classList.add('hidden');
      loginScreen.classList.remove('hidden');
    }else{
      alert(data.error || 'Registration Failed')
    }

  }catch(e){
    console.error('Registration Error: ', e);
  }
});

// handle owners login
document.getElementById('loginForm')?.addEventListener('submit', async(e) => {
  e.preventDefault();

  const logemail = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPass')?.value;
  
  try{
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({
         email: logemail, 
         password: password
      })     
    });
    const data = await res.json();

    if (res.ok) {
      alert('Login Successfully');
      loginScreen.classList.add('hidden');
      adminDashboard.classList.remove('hidden')
    }else{
      alert(data.error || 'Login Failed')
    }
  }catch(e){
    console.error('Login error:', e);
  }
});

// handle password reset
document.getElementById('resetForm')?.addEventListener('submit', async(e) => {
  e.preventDefault();

  const email = document.getElementById('resetEmail')?.value;
  const newPassword = document.getElementById('newPassword')?.value;
  const regSecretPhrase = document.getElementById('resetSecretPhrase')?.value;

  try{
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify({ 
        email: email, 
        regSecretPhrase: regSecretPhrase, 
        newPassword: newPassword 
      }) 
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      resetScreen.classList.add('hidden');
      loginScreen.classList.remove('hidden')
    }else{
      alert(data.error || 'Pasword Reset Failed')
    }
  }catch(e){
    console.error('Password Reset Error: ', e);
  }
});

// lock portal if the admin exist
document.addEventListener('DOMContentLoaded', async() => {
  try{
    const res = await fetch('/api/admin/check-exists');
    const data = await res.json();

    const registrationModal = document.getElementById('registerScreen');
    const loginModal = document.getElementById('loginScreen');
    
    if (data.adminExists) {
      if(registrationModal) registrationModal.classList.add('hidden')
      if(loginModal) loginModal.classList.remove('hidden')
    }
  }catch(e){
    console.error('could not check admi status:', e);
  }
})

// add product
if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      // 1. Collect form data
      const newSnack = {
        name: document.getElementById("pName").value,
        category: document.getElementById("pCategory").value,
        price: Number(document.getElementById("pPrice").value),
        img: document.getElementById("pImg").value,
        inStock: true
      };
  
      try {
        // 2. Send to backend
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSnack)
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Failed to add product');
        }
  
        // 3. Add the saved item directly to the DOM table
        const savedProduct = data.product || newSnack;
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td><img src="${savedProduct.img}" width="35" height="35" style="object-fit:cover; border-radius:4px;"></td>
          <td>${savedProduct.name}</td>
          <td>${savedProduct.category}</td>
          <td>₦${Number(savedProduct.price).toLocaleString()}</td>
          <td>In Stock</td>
          <td><button class="btn-danger" data-id="${savedProduct._id}" onclick="deleteProduct(event)">Delete</button></td>
        `;
        adminProductsTable?.appendChild(newRow);
  
        alert('Product added successfully!');
  
        // 4. Reset form & close modal
        addProductForm.reset();
        productModal?.classList.remove("open", "active");
  
        loadProduct()
      } catch (err) {
        console.error('Error adding snack:', err.message);
        alert(`Error: ${err.message}`);
      }
    });
}

// DELETE PRODUCT (No parameters)
async function deleteProduct(e) {
  const button = e.target;
  const productId = button.getAttribute("data-id");

  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: productId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete product");
    }
    console.log(res);
    // Remove row from table UI
    const row = button.closest("tr");
    if (row) row.remove();

  } catch (err) {
    console.error("Delete product error:", err);
    alert("Error: " + err.message);
  }
}

// load product

async function loadProduct() {
    const adminProductsTable = document.getElementById("adminProductsTable");
    if(!adminProductsTable) return;

    try{
        const response = await fetch('/api/products');
        const products = await response.json();
        
        if (!response.ok) {
            throw new Error(products.error || 'Failed to Load Product')
        }

        // populate table row
        
        adminProductsTable.innerHTML = products.map(p => `
        <tr>
          <td><img src='${p.img}' width='35' height='35' style='object-fit: cover; border-radius: 4px'></td>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>₦${Number(p.price).toLocaleString()}</td>
          <td>${p.inStock ? 'In Stock': 'Out of Stock'}</td>
          <td><button class='btn-danger' data-id="${p._id}" onclick="deleteProduct(event)">Delete</td>
        </tr>
        `).join('');
        
    }catch(err){
        console.error("Error Loading Products:", err.message);
    }
}

// append product

async function appendProduct() {
    const productGrid = document.getElementById('productsGrid');
    if(!productGrid) return;
    try{
        const response = await fetch('/api/products');
        const gProducts = await response.json();

        if (!response.ok) {
            throw new Error(gProducts.error || 'Failed to Load Product');
        }

        productGrid.innerHTML = gProducts.map(gp => `
            <div class="product-card">
              <div class='card-img-container'>
                <img src='${gp.img}' alt='${gp.name}'>
                <span class='category-badge'>${gp.category || 'Snack'}</span>
              </div>
                <div class='product-details'>
                    <h4 class='product-title'>${gp.name}</h4>
                    <div class='product-footer'>
                      <span class='product-price'>₦${Number(gp.price).toLocaleString()}</span>
                      <button class='add-cart-btn' id="cartBtn" onclick="addToCart('${gp._id}', '${gp.name}', '${gp.price}', '${gp.img}')">
                      <i class='fa-solid fa-cart-shopping'></i> Add to Cart
                      </button>
                    </div>
                </div>
            </div>
        `).join('');
    }catch(err){
        console.error("Error Loading Products:", err.message);
    }
}

//  offer modal
document.getElementById("openAddOfferBtn")?.addEventListener("click", () => offerModal?.classList.add("open"));
document.getElementById("closeOfferModal")?.addEventListener("click", () => offerModal?.classList.remove("open"));

// add offer
if (addOfferForm) {
  addOfferForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect all form inputs matching your flash sale requirements
    const newOffer = {
      description: document.getElementById('oDesc').value,
      category: document.getElementById('oCategory')?.value || 'Deals',
      image: document.getElementById('oImage')?.value || 'images/parfait.jpg',
      currentPrice: Number(document.getElementById('oPrice').value),
      oldPrice: document.getElementById('oOriginalPrice') ? Number(document.getElementById('oOriginalPrice').value) : null,
      discountPercentage: document.getElementById('oDiscount') ? Number(document.getElementById('oDiscount').value) : 0,
      stockLeft: document.getElementById('oStockLeft') ? Number(document.getElementById('oStockLeft').value) : 10,
      totalStock: document.getElementById('oTotalStock') ? Number(document.getElementById('oTotalStock').value) : 100,
      active: true
    };

    try {
      // 2. Send to backend
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add product');
      }

      const savedOffer = data.newOffer || data.offer || newOffer;
      console.log(savedOffer);
      // 3. Add offer directly to the admin table DOM
      const newOfferRow = document.createElement("tr");
      newOfferRow.innerHTML = `
        <td><img src="${savedOffer.image}"></td>
        <td>${savedOffer.category || savedOffer.description}</td>
        <td>${savedOffer.description}</td>
        <td>₦${Number(savedOffer.currentPrice || savedOffer.price).toLocaleString()}</td>
        <td>${savedOffer.stockLeft ?? 'N/A'} / ${savedOffer.totalStock ?? 'N/A'} left</td>
        <td>Active</td>
        <td><button class="btn-danger" data-id="${savedOffer._id}" onclick="deleteOffer(event)">Delete</button></td>
      `;

      adminOffersTable?.appendChild(newOfferRow);

      alert('Offer added successfully!');

      // 4. Reset form & close modal
      addOfferForm.reset();
      offerModal?.classList.remove("open", "active");

    } catch (err) {
      console.error(err);
      alert(err.message || 'Error saving offer.');
    }
  });
}

// Append dynamic flash sale deals to the track container
let activeOfferData = [];
async function appendOffer() {
  const offerSlide = document.getElementById('flashDealsTrack');
  if (!offerSlide) return;

  offerSlide.innerHTML = `<p class="loading-msg">Loading flash sales...</p>`;

  try {
    const response = await fetch('/api/offers');

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch offers');
    }

    const sOffers = await response.json();

    // Filter active offers
    const activeOffers = sOffers.filter(offer => offer.active !== false);

    if (!activeOffers || activeOffers.length === 0) {
        offerSlide.innerHTML = '<p class="empty-msg">No flash sales active right now.</p>';
        return;
    }

    activeOfferData = activeOffers;
    console.log(activeOfferData);

// Map offers directly to Jumia-style deal cards
offerSlide.innerHTML = activeOffers.map(offer => {
    // Calculate discount percentage if old price exists and discount percentage isn't explicit
    const oldPriceNum = offer.oldPrice ? Number(offer.oldPrice) : null;
    const currentPriceNum = Number(offer.currentPrice || offer.price || 0);

    let discount = offer.discountPercentage;
    if (!discount && oldPriceNum && oldPriceNum > currentPriceNum) {
        discount = Math.round(((oldPriceNum - currentPriceNum) / oldPriceNum) * 100);
    }

    // Calculate stock progress fill percentage
      const stockLeft = offer.stockLeft ?? 10;
      const totalStock = offer.totalStock || 10;
      const progressPercent = Math.min(Math.round(((totalStock - stockLeft) / totalStock) * 100), 100);

    console.log(offer.totalStock);
    
    return `
      <div class="deal-card-item" data-id="${offer._id}">
          <div class="deal-img-wrapper">
              <span class="stock-badge-top">${stockLeft} items in stock</span>
              <button class="floating-plus-btn" onclick="addFlashSalesToCart('${offer._id}','${offer.description}', '${offer.currentPrice || 0}', '${offer.image}')">+</button>
              <img src="${offer.image || 'images/placeholder.jpg'}" alt="${offer.title}">
          </div>

          <div class="deal-category">${offer.category || 'Special Offer'}</div>
          <h3 class="deal-product-title">${offer.description}</h3>
          
          <div class="rating-row">
              ★ <span>${offer.ratingStars || '4.5'}</span> 
              <span class="rating-count">(${offer.ratingCount || 10})</span>
          </div>

          <div class="deal-progress-bar-bg">
              <div class="deal-progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>

          <div class="deal-price-row">
              <span class="deal-current-price">₦${currentPriceNum.toLocaleString()}</span>
              ${oldPriceNum ? `<span class="deal-old-price">₦${oldPriceNum.toLocaleString()}</span>` : ''}
              ${discount ? `<span class="deal-discount-pill">-${discount}%</span>` : ''}
          </div>
      </div>
  `;
}).join('');

  } catch (err) {
      console.error('Error Loading Offers:', err.message);
      offerSlide.innerHTML = `<p class="error-msg">Unable to load offers right now.</p>`;
  }
}

// Handle click on the green action/buy button
document.addEventListener('click', async (e) => {
  // Check if the clicked element (or its parent) is your green button
  const greenBtn = e.target.closest('.floating-plus-btn'); // Replace with your actual green button class/ID
  if (!greenBtn) return;

  // Get the offer ID from the closest card element
  const card = greenBtn.closest('.floating-plus-btn');
  const offerId = card?.getAttribute('data-id');
  if (!offerId) return;

  try {
      const response = await fetch(`/api/offers/${offerId}/purchase`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (!response.ok) {
          throw new Error(data.message || 'Failed to update stock');
      }

      // Successfully updated backend! Now reload or update the UI dynamically
      console.log('Stock updated in DB:', data.offer);
      
      // Re-run your appendOffer function to refresh the progress bar and stock counts on screen
      appendOffer();

  } catch (err) {
      console.error('Error updating purchase:', err);
      alert(err.message);
  }
});

async function addFlashSalesToCart(offerId, description, price, img) {
  console.log('plus btn clicked for id', offerId);
  console.log('current offer ', activeOfferData);
  const offer = activeOfferData.find(o => String(o._id) === String(offerId));

  if (offer) {
    if (offer.stockLeft > 0) {
      offer.stockLeft -= 1;
      console.log('new stock left', offer.stockLeft);
      const itemSold = offer.totalStock - offer.stockLeft;
      const progressPercent = offer.totalStock > 0 ? Math.min(Math.round((itemSold / offer.totalStock) * 100), 100) : 0;

      const card = document.querySelector(`[data-id="${offerId}"]`);
      console.log('found card', card);
      if (card) {
        const fillBar = card.querySelector('.deal-progress-bar-fill');
        const badge = card.querySelector('.stock-badge-top');

        if(fillBar) fillBar.style.width = `${progressPercent}%`;
        if(badge) badge.textContent = `${offer.stockLeft} items in stock`;
      }

    }else{
      alert('This flash sale item is sold out!');
      return;
    }
  }else{
    console.error('Error: offer could not be found');
  }
  
    try {
      const res = await fetch('/api/offers');
      console.log(res);
      // 1. Check response status before parsing JSON
      if (!res.ok) {
          console.error('Failed to fetch offers status:', res.status);
          return;
      }
  
      const offers = await res.json();
      const offer = offers.find(o => String(o._id) === String(offerId) || String(o.o_id) === String(offerId));
      
      if (!offer) {
          console.error('Offer not found for ID:', offerId);
          return;
      }
      
      const realId = offerId._id || offer.o_id;
      // 2. Retrieve existing cart or initialize
      let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
      console.log(cart);
      let existingItem = cart.find(item => String(item.id) === String(realId));
      console.log(cart);
      if (existingItem) {
          existingItem.quantity += 1;
      } else {
        cart.push({
            id: realId,
            name: offer.title || offer.description || 'Special Offer',
            description: offer.description || '',
            price: Number(offer.currentPrice || offer.price || 0),
            quantity: 1,
            img: offer.image || 'images/parfait.jpg'
        });
      }
  
      // 3. Save to storage & refresh UI
      sessionStorage.setItem('cart', JSON.stringify(cart));
      
      if (typeof refreshCartUI === 'function') {
          refreshCartUI();
      }
  
    } catch (e) {
        console.error('Error adding Offer:', e.message);
    }
  
}

// Load offers into the admin dashboard table
async function loadOffer() {
  const adminOffersTable = document.getElementById('adminOffersTable');
  if (!adminOffersTable) return;

  adminOffersTable.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 1rem;">Loading offers...</td></tr>`;

  try {
      const response = await fetch('/api/offers');

      // 1. Check response status first before parsing json
      if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to load offers');
      }

      const offers = await response.json();

      // 2. Handle empty table state
      if (!offers || offers.length === 0) {
          adminOffersTable.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 1rem;">No offers found in the database.</td></tr>`;
          return;
      }

      // 3. Render table rows dynamically matching your expanded table columns
  adminOffersTable.innerHTML = offers.map(o => `
      <tr>
        <td>
            <img src="${o.image || 'images/placeholder.jpg'}" alt="" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
        </td>
        <td>${o.category || 'Deals'}</td>
        <td>${o.description}</td>
        <td>₦${Number(o.currentPrice || o.price || 0).toLocaleString()}</td>
        <td>${o.stockLeft ?? 'N/A'} / ${o.totalStock ?? 'N/A'} left</td>
        <td>${o.active !== false ? 'Active' : 'Inactive'}</td>
        <td>
            <button class="btn-danger" data-id="${o._id}" onclick="deleteOffer(event)">Delete</button>
        </td>
      </tr>
  `).join('');

  } catch (e) {
      console.error('Error Loading Offer:', e.message);
      adminOffersTable.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red; padding: 1rem;">Error loading offers from server.</td></tr>`;
  }
}

// DELETE OFFER
async function deleteOffer() {
  const button = event.target;
  const offerId = button.getAttribute("data-id");

  if (!confirm("Are you sure you want to delete this offer?")) return;

  try {
    const res = await fetch(`/api/offers/${offerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: offerId }),
    });
    const data = await res.json();
    if (!res.ok) {
      
      throw new Error(data.message || "Failed to delete offer");
    }

    // Remove row from table UI
    const row = button.closest("tr");
    if (row) row.remove();

  } catch (err) {
    console.error("Delete offer error:", err);
    alert("Error: " + err.message);
  }
}

async function renderProducts(category) {
  if (!productsGrid) return;

  try {
    const res = await fetch('/api/products');
    const prod = await res.json();

    const filtered = category === 'all' ? prod : prod.filter(p => p.category === category);
    
    if (filtered.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; width: 100%">NO PRODUCT AVAILABLE</p>';
    }
   
    productsGrid.innerHTML = filtered.map(p => {
    return `<div class="product-card">
    <div class='card-img-container'>
      <img src='${p.img}' alt='${p.name}'>
      <span class='category-badge'>${p.category}</span>
    </div>
      <div class='product-details'>
          <h4 class='product-title'>${p.name}</h4>
          <div class='product-footer'>
            <span class='product-price'>₦${Number(p.price).toLocaleString()}</span>
            <button class='add-cart-btn' onclick="addToCart('${p._id}', '${p.name}', '${p.price}', '${p.img}')">
            <i class='fa-solid fa-cart-shopping'></i> Add to Cart
            </button>
          </div>
      </div>
  </div>`}).join('');

  } catch (error) {
    console.error('Category Load Failed:', error);
  }
}


// Category Filter Handlers
document.querySelectorAll(".pill").forEach(pill => {
  pill.addEventListener("click", (e) => {
    document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    e.currentTarget.classList.add("active");
    renderProducts(e.currentTarget.dataset.category);
  });
});

// open && close the cart sidebar
document.getElementById('openCartBtn')?.addEventListener('click', () => {
    document.getElementById('cartOverlay').classList.add('open')
    document.getElementById('cartSidebar').classList.add('open')
});
document.getElementById('closeCartBtn')?.addEventListener('click', () => {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartSidebar').classList.remove('open');
})

// add to cart

function addToCart(productId, name, price, img) {
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  if (!Array.isArray(cart)) {
    cart = [];
  }

  //  check if th prod eist
  let existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  }else{
    cart.push({
          id: productId,
          name: name,
          price: Number(price),
          img: img,
          quantity: 1
        });
  }

  sessionStorage.setItem('cart', JSON.stringify(cart));

  refreshCartUI();
  console.log('cart added to session storage: ', cart);
}
//  function to update both badge count and sidebar drawer
function refreshCartUI() {
    let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (!Array.isArray(cartItems)) {
      cartItems = [];
    }
      //  update the badge number
      const badge = document.getElementById('cartBadge');
      if (badge) {
        const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = totalCount;
      }
      // render the sidebar items
      const cartItemsContainer = document.getElementById('cartItemsContainer');
      const cartTotaAmount = document.getElementById('cartTotalAmount');
      const checkOutBtn = document.getElementById('openCheckoutBtn');

      if (!cartItemsContainer) return;
      
      if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class='empty-cart-msg' style="text-align: center; padding: 2.5rem 1rem">
            <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; color: #d0b0a0; margin-bottom: 0.75rem"></i>
            <p style="color: #888; font-size: 0.9rem; margin: 0;">Your basket is empty</p>
          </div>`;
          if(cartTotaAmount) cartTotaAmount.textContent = '₦0.00';
          if(checkOutBtn) checkOutBtn.classList.add('disabled')
          return;
      }
      // render cart items
      let total = 0;
      cartItemsContainer.innerHTML = cartItems.map(item => {
        const price = Number(item.price || item.amount) || 0;
        const qty = Number(item.quantity) || 1;
        total += price * qty;
  
        return `
          <div class="cart-item">
            <div style="display: flex"; align-items: center; gap: 10px">
              ${item.img ? `<img src="${item.img}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50px">` : ''}
              <div class="cart-item-details">
                <h4>${item.name || 'Bakery Item'}</h4>
                ${item.description ? `<p style="font-size: 0.85rem; color: #666; margin: 2px 0">${item.description}</p>` : ''}
                <p>₦${price.toLocaleString()} * ${qty}</p>
              </div>
            </div>
            <div class="cart-item-controls">
                <span class="qty-btn" onclick="decreaseQty('${item.id}')">-</span>
                <span class="qty-btn" onclick="increaseQty('${item.id}')">+</span>
            </div>
          </div>`;
      }).join('');

      if (cartTotaAmount) cartTotaAmount.textContent = `₦${total.toLocaleString()}`;
      if(checkOutBtn) checkOutBtn.classList.remove('disabled')
}
// increase cart
function increaseQty(productId) {
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

  let item = cart.find(cartItem => cartItem.id === productId);
  if (item) {
    item.quantity += 1;
    sessionStorage.setItem('cart', JSON.stringify(cart));
    refreshCartUI()
  }
}

// decrease cart
function decreaseQty(productId) {
  let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

  let itemIndex = cart.findIndex(cartItem => cartItem.id === productId);

  if (itemIndex > -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1
    }else{
      cart.splice(itemIndex, 1);
    }
    sessionStorage.setItem('cart', JSON.stringify(cart));
    refreshCartUI();
  }
}

// open checkout modal
document.getElementById('openCheckoutBtn')?.addEventListener('click', () => {
  document.getElementById('checkoutModal')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.remove('open')
});

//  btn delivery
document.getElementById('btnDelivery')?.addEventListener('click', () => {
  document.getElementById('addressContainer').classList.remove('hidden');
  document.getElementById('btnPickup')?.classList.remove('active')
  document.getElementById('btnDelivery')?.classList.add('active')
});

// store pickup
document.getElementById('btnPickup')?.addEventListener('click', () => {
  document.getElementById('addressContainer').classList.add('hidden');
  document.getElementById('btnDelivery')?.classList.remove('active')
  document.getElementById('btnPickup')?.classList.add('active')
});

// copy acc num
const copyAccBtn = document.getElementById('copyAccBtn');
if(copyAccBtn){
  copyAccBtn.addEventListener('click', () => {
    //  the txt u want to cpy
    const textToCopy = '9158555361';
    navigator.clipboard.writeText(textToCopy)
    .then(() => {
      //  change he btn text
      copyAccBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyAccBtn.textContent = 'Copy';
       }, 2000); //after 2 seconds reset back to copy
    }).catch(e => {
      console.error('Failed to copy the text', e)
    })
  })
}
//  close modalBtn
document.getElementById('closeModalBtn')?.addEventListener('click', () => {
  document.getElementById('checkoutModal').classList.remove('open')
});

// add order to the DB

if(btnWhatsapp){
  btnWhatsapp.addEventListener('click', async (e) => {
    e.preventDefault();
// grab cust details from the input
    const customer = document.getElementById('custName')?.value;
    const phone = document.getElementById('custPhone')?.value;
    const senderName = document.getElementById('senderName')?.value;

    if (!customer || !phone || !senderName) {
      alert('All Field are Required')
    }
    // grab item from session storage
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    
    let totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let items = cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const orderData = {customer, phone, senderName, custAddress, items, totalAmount};

      // Save order to DB
   try{
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify(orderData)
      });

      if(res.ok){
        const savedOrders = await res.json();
        console.log('Order saved successfully:', savedOrders);
      }else{
        console.warn('order API rssponded with a status:', res.status);
      }
   }catch(orderErr){
    console.warn('Could not save to api', orderErr.message);
   }

    sessionStorage.removeItem('cart');
    alert('Order Placed Successfully');

    // 4. Reset form & close modal
    document.getElementById('checkoutForm')?.reset();
    document.getElementById('checkoutModal')?.classList.remove("open");

    if (typeof appendOffer === 'function') {
      await appendOffer();
    }
        // build whatsapp text
    const phoneNumber = '2348130996975';
     const addressField = document.getElementById('custAddress').value;
     const address = addressField ? addressField.value : 'PickUp';
    // formatted msg
    let message = `Hello MD-FLOURISH BAKERY! I want to place an Order this:\n\n  *---ORDER ITEMS ---*\n`;
    let grandTotal = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      grandTotal += itemTotal;

      message += `${index + 1}. *${item.name}*\n`;
      message += ` Qty: ${item.quantity} | Price: ₦${Number(item.price).toLocaleString()} | Total: ₦${Number(itemTotal).toLocaleString()}\n\n`
    });

    message += `Grand Total: ₦${Number(grandTotal).toLocaleString()}*\n\n`;
    message += `*--- CUSTOMER DETAILS ---*\n`;
    message += ` *Name:* ${senderName}\n`;
    message += ` *Phone:* ${phone}\n`;
    message += ` *Address:* ${address}\n\n`;
    message += `Please confirm my order. Thank You!`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank')
  });
}

// append custumer order to tb

async function setupCustomerOrderTb() {
  const adminOrdersTable = document.getElementById('adminOrdersTable');
  if(!adminOrdersTable) return;
  try{
    const res = await fetch('/api/orders');
    const orders = await res.json();
   
    adminOrdersTable.innerHTML = '';

    orders.forEach(order => {
      const formatedDate = new Date(order.createdAt).toLocaleDateString();
      const itemSummary = order.items.map(item => `${item.name} (${item.quantity})`).join(',');

      const isPending = (order.fulfillmentMethod || 'Pending') === 'Pending';
      const statusClass = order.fulfillmentMethod === 'Pending' ? 'pending' : 'fulfilled';
      
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${formatedDate}</td>
        <td style="font-size: 1rem; font-weight: bold; color: black; text-transform: capitalize">${order.customer}</td>
        <td style="font-size: 1rem; font-weight: bold; color: black; text-transform: capitalize">${itemSummary}</td>
        <td style="font-size: 1rem; font-weight: bold; color: black">₦${order.totalAmount?.toLocaleString() || 0}</td>
        <td style="font-size: 1rem; font-weight: bold; color: black; text-transform: capitalize">${order.senderName || 'N/A'}</td>
        <td><span class="${statusClass}">${order.fulfillmentMethod || 'Pending'}</span></td>
        <td>${isPending ? `<button class="btn-success" onclick="markAsfulfilled('${order._id}')">Fulfill</button>` : '<span>Completed</span>'}</td>
        <td><button class="btn-danger" data-id='${order._id}' onclick="deleteOrder(event)">Delete</button></td>
      `    
        adminOrdersTable.appendChild(newRow);
    });
  }catch(e){
    console.error(e);
  }
}

async function markAsfulfilled(orderId) {
  try{
    const res = await fetch(`api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type' : 'application/json' }
    });
    if(!res.ok) throw new Error('Failed to Update Status');

    setupCustomerOrderTb();
  }catch(e){
    console.error('Error Updating Status:', e);
  }
}

// delete order
async function deleteOrder() {
  const button = event.target;
  const orderId = button.getAttribute("data-id");

  if (!confirm("Are you sure you want to delete this order?")) return;

  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: orderId }),
    });
    const data = await res.json();
    if (!res.ok) {
      
      throw new Error(data.message || "Failed to delete offer");
    }

    // Remove row from table UI
    const row = button.closest("tr");
    if (row) row.remove();

  } catch (err) {
    console.error("Delete offer error:", err);
    alert("Error: " + err.message);
  }
}

// add event order to te db - pre-order cake
const eventWhatsappOrder = document.getElementById('eventWhatsappOrder');

if(eventWhatsappOrder){
  eventWhatsappOrder.addEventListener('click', async (e) => {
    e.preventDefault();

    const eventTypeName = document.getElementById('eventTypeName')?.value;
    const eventType = document.getElementById('eventType')?.value;
    const eventDate = document.getElementById('eventDate')?.value;
    const eventCustPhone = document.querySelector('.phone')?.value;
    const eventCustEmail = document.getElementById('custEmail')?.value;
    const eventGuests = document.getElementById('eventGuests')?.value;
    const eventNotes = document.getElementById('eventNotes')?.value;

    const eventOrder = {
      customerName: eventTypeName,
      eventType: eventType,
      eventDate: eventDate,
      phone: eventCustPhone,
      email: eventCustEmail,
      guestSize: eventGuests,
      additionalDetails: eventNotes,
      status: 'Pending'
    }

    try{
      const res = await fetch('/api/event-orders', {
        method: 'POST',
        headers: { "Content-Type" : "Application/json"},
        body: JSON.stringify(eventOrder)
      });

      const savedEventOrder = await res.json();

      if (!res.ok) {
        throw new Error(savedEventOrder.message || 'Failed to add Event Order')
      }
      // add offer directly to the dom

      const newEventRow = document.createElement("tr");
      newEventRow.innerHTML = `
        <td>${savedEventOrder.customerName}</td>
        <td>${savedEventOrder.eventType}</td>
        <td>${savedEventOrder.eventDate}</td>
        <td>${savedEventOrder.phone}</td>
        <td>${savedEventOrder.email}</td>
        <td>${savedEventOrder.guestSize}</td>
        <td><button class="btn-danger" data-id="${savedEventOrder._id}" onclick='deleteEventOrder(event)'>Delete</button></td>
      `;

      adminEventOrderTable?.appendChild(newEventRow)
      alert('Event Order added successfully!');

      // // grab item from session storage
      let message = `Hello MD-FLOURISH Bakery! I would love to book a Special Event cake:%0A%0A` +
                    `*Name:* ${eventTypeName}%0A` +
                    `*Event Type:* ${eventType}%0A` +
                    `*Event Date:* ${eventDate}%0A` +
                    `*Phone:* ${eventCustPhone}%0A` +
                    `*Email:* ${eventCustEmail}%0A` +
                    `*Guest/Size:* ${eventGuests}%0A` +
                    `*Details:* ${eventNotes || 'None'}%0A`;

      let phoneNumber = '2348130996975';
      let whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
      // 4. Reset form & close modal
      eventOrderForm.reset();
      eventModal?.classList.add("hidden");

      window.open(whatsappUrl, '_blank')
    }catch(e){
      console.error('Error saving to DB:', e);
    }
  });
}

// event pre-order
async function setUpEventOrderTb() {
  const adminEventOrdersTable = document.getElementById('adminEventOrderTable');
  if (!adminEventOrdersTable) return;
  try{
    const res = await fetch('/api/event-orders');
    const eventOrder = await res.json();

    adminEventOrdersTable.innerHTML = '';

    eventOrder.forEach(event => {

      const isPending = (event.status || 'Pending') === 'Pending';
      const statusClass = event.status === 'Pending' ? 'pending' : 'fulfilled';
      
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${event.customerName}</td>
        <td>${event.eventType}</td>
        <td>${event.eventDate}</td>
        <td>${event.phone}</td>
        <td>${event.guestSize}</td>
        <td><span class="${statusClass}">${event.status || 'Pending'}</span></td>
        <td>${isPending ? `<button class="btn-success" onclick="markEventAsFulfilled('${event._id}')">Fulfill</button>` : '<span>Completed</span>'}</td>
        <td><button class="btn-danger" data-id='${event._id}' onclick="deleteEventOrder(event)">Delete</button></td>
      `;    
        adminEventOrdersTable.appendChild(newRow);
    })
  }catch(e){
    console.error(e);
  }
}

// mark event as fulfilled
async function markEventAsFulfilled(eventId) {
  try{
    const res = await fetch(`api/event-orders/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type' : 'application/json' }
    });

    if(!res.ok) throw new Error('Failed to Update Status');
    alert('Updated Successfully');
    setUpEventOrderTb();
  }catch(e){
    console.error('Error Updating Status:', e);
  }
}

// delete event order

async function deleteEventOrder() {
  const button = event.target;
  console.log(button);
  const eventOrderId = button.getAttribute("data-id");

  if (!confirm("Are you sure you want to delete this Order?")) return;

  try {
    const res = await fetch(`/api/event-orders/${eventOrderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: eventOrderId }),
    });
    const data = await res.json();
    if (!res.ok) {
      
      throw new Error(data.message || "Failed to delete Event Order");
    }

    // Remove row from table UI
    const row = button.closest("tr");
    if (row) row.remove();

  } catch (err) {
    console.error("Delete event order error:", err);
    alert("Error: " + err.message);
  }
}

// Total sales

async function calculateTotalSales() {
  try{
    const res = await fetch('/api/orders');
    const orders = await res.json();

    let total = 0;

    orders.forEach(order => {
      if (order.fulfillmentMethod === 'Fulfilled') {
        const orderTotal = Number(order.totalAmount) || 0;
        total += orderTotal;
      }
    });
    const salesDisplay = document.getElementById('statSales');

    if (salesDisplay) {
      salesDisplay.textContent = `₦${total.toLocaleString() || 0}`;
    }
  }catch(e){
    console.error('Failed to calculate Total Sales:', e);
  }
}

// pending order

async function calculatePendingOrder() {
  try{
    const res = await fetch('/api/orders');
    const pendingOrder = await res.json();

    let total = 0;

    pendingOrder.forEach(pOrder => {
      if (pOrder.fulfillmentMethod === 'Pending') {
        const pending = pOrder.items.length;
        total += pending;
      }
    });
    const pendingDisplay = document.getElementById('statPending');

    if (pendingDisplay) {
      pendingDisplay.textContent = total + ' Pending Order Left';
    }
  }catch(e){
    console.error('Failed to Calculate total Pending Order:', e);
  }
}

// total orders

async function calculateTotalOrder() {
  try {
    const res = await fetch('/api/orders');
    const totalOrder = await res.json();

    let total = 0;

    const order = totalOrder.length;
    total = order;

    const totalDisplay = document.getElementById('statOrders');
    if (totalDisplay) {
      totalDisplay.textContent = total;
    }

  } catch (e) {
    console.error('Failed to Calculate total Order:', e);
  }

}

// TESTIMONIAL CAROUSEL
let currentIndex = 0;
let autoSlideInterval;

function moveCarousel(direction) {
  const track = document.getElementById('testimonial-card');
  if(!track) return;

  const cards = track.children;

  if (cards.length === 0) return;

  const cardWidth = cards[0].getBoundingClientRect().width + 20;
  const visibleCardCount = Math.floor(track.parentElement.clientWidth / cardWidth)
  const maxIndex = Math.max(0, cards.length - visibleCardCount);

  currentIndex += direction;

  if (currentIndex < 0) {
    currentIndex = maxIndex;
  }else if(currentIndex > maxIndex){
    currentIndex = 0;
  }
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  
  const prevBtn = document.querySelector('.prev-arrow')
  const nextBtn = document.querySelector('.next-arrow')

  if (prevBtn) {
    if (currentIndex === 0) {
       prevBtn.style.display = 'none';
    }else{
      prevBtn.style.display = 'flex';
    }
  }

  if (nextBtn) {
    if(currentIndex >= maxIndex){
      nextBtn.style.display = 'none';
    }else{
      nextBtn.style.display = 'flex';
    }
  }

  resetAutoSlide();
}

function moveCarousel(direction) {
  const track = document.getElementById('flashDealsTrack');
  if(!track) return;

  const cards = track.children;

  if (cards.length === 0) return;

  const cardWidth = cards[0].getBoundingClientRect().width + 20;
  const visibleCardCount = Math.floor(track.parentElement.clientWidth / cardWidth)
  const maxIndex = Math.max(0, cards.length - visibleCardCount);

  currentIndex += direction;

  if (currentIndex < 0) {
    currentIndex = maxIndex;
  }else if(currentIndex > maxIndex){
    currentIndex = 0;
  }
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
  
  const prevBtn = document.querySelector('.prev-arrow')
  const nextBtn = document.querySelector('.next-arrow')

  if (prevBtn) {
    if (currentIndex === 0) {
       prevBtn.style.display = 'none';
    }else{
      prevBtn.style.display = 'flex';
    }
  }

  if (nextBtn) {
    if(currentIndex >= maxIndex){
      nextBtn.style.display = 'none';
    }else{
      nextBtn.style.display = 'flex';
    }
  }

  resetAutoSlide();
}

// function to start automatic sliding
function startAutoSlide() {
  clearInterval(autoSlideInterval);

  autoSlideInterval = setInterval(() => {
    moveCarousel(1);
  }, 4000);
}
// function to reset the timer on manual click
function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}
startAutoSlide();
// HARDCODED TESTIMONNIAL
 
const hardCodedTestimonial = [
  { custName: 'Amina Yussuf',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    reviewText: 'THE BIRTHDAY CAKE I ORDERED WAS ABSOLUTE MASTERPIECE!, Everyone kept asking where we got it from.',
  },
  { custName: 'Amar salman',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    reviewText: 'Thanks to you, we had a sweetest anniversary celebration. Truly frsh and delicious!',
  },
  { custName: 'Faruq Badr',
    avatarUrl: 'https://randomuser.me/api/portraits/men/85.jpg',
    reviewText: 'Being recommended to this bakerywas the most excitingthing. Absolutely love the treats!',
  },
  { custName: 'Bilal jeishu',
    avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
    reviewText: 'All the guests enjoyed every single bite of the snacks. Exceptional quality and prompt service.',
  }
];

function loadTestimonial() {
  const track = document.getElementById('testimonial-card');
  if(!track) return;
  track.innerHTML = '';

  hardCodedTestimonial.forEach(item => {
    const card = document.createElement('div');
    card.className = 'carousel-card';
    card.innerHTML = `
      <div>
          <div class="testimonial-header">
            <img src="${item.avatarUrl}" class="testimonial-avatar">
            <div class="testimonial-info">
              <h3>${item.custName}</h3>
              <div class="testimonial-star">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
            <p class="testimonial-text">${item.reviewText}</p>
      </div>
    `;
    track.appendChild(card);
  });
}

// calculate combo price
function calculateComboPrice() {
  const originalPrice = parseFloat(document.getElementById('oOriginalPrice').value) || 0;
  const discountPercentage = parseFloat(document.getElementById('oDiscount').value) || 0;

  if (originalPrice > 0 && discountPercentage >= 0) {
    // comboPrice = originalPrice * (discountPecentage / 100)
    const discountAmount = originalPrice * (discountPercentage / 100)
    const comboPrice = Math.round(originalPrice - discountAmount);

    // set the calculate combo price value
    document.getElementById('oPrice').value = comboPrice > 0 ? comboPrice : 0;
  }
  else{
    document.getElementById('oPrice').value = '';
  }
}

// toggle offer btn
const toggleBtn = document.getElementById('toggleBtn');
if(toggleBtn){
  const flashSaleActive = localStorage.getItem('flashSaleActive') !== 'false';
  toggleBtn.checked = flashSaleActive;

  toggleBtn.addEventListener('change', (e) => {
    localStorage.setItem('flashSaleActive', e.target.checked)
  });
}

const flashSaleContainer = document.querySelector('.flash-sales-container');
if (flashSaleContainer) {
  const flashSaleActive = localStorage.getItem('flashSaleActive');

  if (flashSaleActive === 'false') {
    flashSaleContainer.style.display = 'none';
  }else{
    flashSaleContainer.style.display = 'block';
  }
}

// img accepter

const imageInput = document.getElementById('pImg');
document.getElementById('plusIconBtn')?.addEventListener('click', () => {
  imageInput.type = 'file';
  imageInput.click();
});

imageInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (uploadEvent) {
      imageInput.type = 'text';
      imageInput.value = uploadEvent.target.result;
    }
    reader.readAsDataURL(file)
  }
});
window.addEventListener('focus', () => {
  const imageInput = document.getElementById('pImg');
  if (imageInput?.type == 'file' && !imageInput?.value) {
    imageInput.type = 'text';
  }
}, {once: true});

const offerImage = document.getElementById('oImage');
if (offerImage) {
  const plusIconBtn = document.getElementById('plusIconBtns');
  if (plusIconBtn) {
    document.getElementById('plusIconBtns')?.addEventListener('click', () => {
      offerImage.type = 'file';
      offerImage.click();
    });
  }
}


offerImage?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (uploadEvent) {
      offerImage.type = 'text';
      offerImage.value = uploadEvent.target.result;
    }
    reader.readAsDataURL(file)
  }
});
window.addEventListener('focus', () => {
  const offerImage = document.getElementById('oImage');
  if (offerImage?.type == 'file' && !offerImage?.value) {
    offerImage.type = 'text';
  }
}, {once: true});

const seeAllBtn = document.getElementById('seeAllBtn');
const flashDealsTrack = document.getElementById('flashDealsTrack');
if (seeAllBtn && flashDealsTrack) {
  if (flashDealsTrack.scrollWidth > flashDealsTrack.clientWidth) {
    seeAllBtn.style.display = 'inline-flex';
  }else{
    seeAllBtn.style.display = 'none'
  }
}


document.addEventListener('DOMContentLoaded', refreshCartUI)
document.addEventListener('DOMContentLoaded', appendOffer)
document.addEventListener('DOMContentLoaded', loadOffer)
document.addEventListener('DOMContentLoaded', appendProduct)
document.addEventListener('DOMContentLoaded', loadProduct)
document.addEventListener('DOMContentLoaded', setupCustomerOrderTb)
document.addEventListener('DOMContentLoaded', setUpEventOrderTb)
document.addEventListener('DOMContentLoaded', calculateTotalSales)
document.addEventListener('DOMContentLoaded', calculatePendingOrder)
document.addEventListener('DOMContentLoaded', calculateTotalOrder)
document.addEventListener('DOMContentLoaded', loadTestimonial)