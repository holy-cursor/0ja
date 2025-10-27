// Shared product data storage
// In production, this would be a database

export interface Product {
  id: string;
  creator_wallet: string;
  slug: string;
  title: string;
  description: string;
  price_amount: number;
  price_token: string;
  file_url: string;
  success_redirect: string;
  image_url: string;
  paused: boolean;
  created_at: string;
}

// Global variable to persist data across requests
declare global {
  var __products: Product[] | undefined;
}

// In-memory storage for products (persists across requests in development)
if (!global.__products) {
  global.__products = []; // Start with empty array - no mock data
}

const products = global.__products!;

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function addProduct(product: Product): void {
  products.push(product);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}
