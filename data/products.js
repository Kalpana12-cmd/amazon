import { formatCurrency } from '../Scripts/utils/money.js';

export function getProduct(productId) {
  return products.find(product => product.id === productId);
}

class Product {
  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.rating = productDetails.rating;
    this.priceCents = productDetails.priceCents;
  }

  getStarsUrl() {
    return `images/ratings/rating-${this.rating.stars * 10}.png`;
  }

  getPrice() {
    return `$${formatCurrency(this.priceCents)}`;
  }

  extraInfoHTML() {
    return '';
  }
}

class Clothing extends Product {
  constructor(productDetails) {
    super(productDetails);
    this.sizeChartLink = productDetails.sizeChartLink;
  }

  extraInfoHTML() {
    return `<a href="${this.sizeChartLink}" target="_blank">Size Chart</a>`;
  }
}

export let products = [];

export function loadProductsFetch() {
  return fetch('https://supersimplebackend.dev/products')
    .then(response => {
      if (!response.ok) throw new Error('Network response failed');
      return response.json();
    })
    .then(productsData => {
      products = productsData.map(productDetails =>
        productDetails.type === 'clothing' 
          ? new Clothing(productDetails) 
          : new Product(productDetails)
      );
      console.log('Products loaded:', products);
    })
    .catch(error => {
      console.error('Failed to load products:', error);
      // Fallback: Load mock data if API fails
      products = getMockProducts();
    });
}

export function loadProducts(callback) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener('load', () => {
    try {
      products = JSON.parse(xhr.response).map(productDetails =>  // Fixed: JSON.parse
        productDetails.type === 'clothing' 
          ? new Clothing(productDetails) 
          : new Product(productDetails)
      );
      console.log('Products loaded:', products);
      callback();
    } catch (error) {
      console.error('Failed to parse products:', error);
      products = getMockProducts(); // Fallback
      callback();
    }
  });

  xhr.addEventListener('error', () => {
    console.error('Request failed');
    products = getMockProducts(); // Fallback
    callback();
  });

  xhr.open('GET', 'https://supersimplebackend.dev/products');
  xhr.send();
}

// Mock data for fallback
function getMockProducts() {
  return [
    {
      id: '1',
      image: 'images/products/shirt.jpg',
      name: 'Fallback Product',
      rating: { stars: 4.5, count: 120 },
      priceCents: 1999,
      type: 'clothing',
      sizeChartLink: '#'
    }
  ];
}