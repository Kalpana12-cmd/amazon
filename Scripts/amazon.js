import {cart, addToCart} from '../data/cart.js';
import {products, loadProducts, loadProductsFetch} from '../data/products.js';
import { formatCurrency } from './utils/money.js';

// Main initialization function
async function initialize() {
  try {
    // Show loading state
    showLoadingState();
    
    // Load products (using fetch version for modern approach)
    await loadProductsFetch();
    
    // Render products
    renderProductsGrid();
    
    // Initialize cart functionality
    setupCartInteractions();
  } catch (error) {
    // Show error state if something fails
    showErrorState();
    console.error('Failed to initialize:', error);
  }
}

// Show loading spinner while products load
function showLoadingState() {
  document.querySelector('.js-products-grid').innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>
  `;
}

// Show error message if loading fails
function showErrorState() {
  document.querySelector('.js-products-grid').innerHTML = `
    <div class="error-state">
      <p>⚠️ Failed to load products. Please try again later.</p>
      <button class="retry-button">Retry</button>
    </div>
  `;
  
  // Add retry functionality
  document.querySelector('.retry-button').addEventListener('click', initialize);
}

// Render product grid
function renderProductsGrid() {
  if (!products || products.length === 0) {
    showErrorState();
    return;
  }

  const productHtml = products.map(product => `
    <div class="product-container" data-product-id="${product.id}">
      <div class="product-image-container">
        <img class="product-image" src="${product.image}" alt="${product.name}">
      </div>

      <div class="product-name limit-text-to-2-lines">
        ${product.name}
      </div>

      <div class="product-rating-container">
        <img class="product-rating-stars" 
             src="${product.getStarsUrl()}" 
             alt="Rating: ${product.rating.stars} stars">
        <div class="product-rating-count link-primary">
          ${product.rating.count}
        </div>
      </div>

      <div class="product-price">
        ${product.getPrice()}
      </div>

      <div class="product-quantity-container">
        <select class="js-quantity-selector">
          ${Array.from({length: 10}, (_, i) => `
            <option value="${i+1}" ${i === 0 ? 'selected' : ''}>${i+1}</option>
          `).join('')}
        </select>
      </div>

      ${product.extraInfoHTML()}

      <div class="product-spacer"></div>

      <div class="added-to-cart js-added-to-cart">
        <img src="images/icons/checkmark.png" alt="Added to cart">
        Added
      </div>

      <button class="add-to-cart-button button-primary js-add-to-cart"
              data-product-id="${product.id}">
        Add to Cart
      </button>
    </div>
  `).join('');

  document.querySelector('.js-products-grid').innerHTML = productHtml;
}

// Setup cart interactions
function setupCartInteractions() {
  // Update cart quantity on page load
  updateCartQuantity();

  // Add event listeners for all add-to-cart buttons
  document.querySelectorAll('.js-add-to-cart').forEach(button => {
    button.addEventListener('click', async () => {
      const productId = button.dataset.productId;
      const quantity = parseInt(button.closest('.product-container')
                          .querySelector('.js-quantity-selector').value);
      
      try {
        // Show loading feedback
        button.disabled = true;
        button.textContent = 'Adding...';
        
        await addToCart(productId, quantity);
        updateCartQuantity();
        showAddedFeedback(button);
      } catch (error) {
        console.error('Error adding to cart:', error);
        button.textContent = 'Error - Try Again';
      } finally {
        setTimeout(() => {
          button.disabled = false;
          button.textContent = 'Add to Cart';
        }, 2000);
      }
    });
  });
}

// Show "Added" feedback when product is added to cart
function showAddedFeedback(button) {
  const addedElement = button.closest('.product-container')
                            .querySelector('.js-added-to-cart');
  addedElement.style.opacity = '1';
  addedElement.style.visibility = 'visible';
  
  setTimeout(() => {
    addedElement.style.opacity = '0';
    addedElement.style.visibility = 'hidden';
  }, 2000);
}

// Update cart quantity display
function updateCartQuantity() {
  const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const cartElement = document.querySelector('.js-cart-quantity');
  
  if (cartElement) {
    cartElement.textContent = cartQuantity;
    cartElement.style.display = cartQuantity > 0 ? 'block' : 'none';
  }
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);