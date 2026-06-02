import { prisma } from '../lib/prisma.js';

export class CartError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CartError';
  }
}

export class ProductNotFoundError extends CartError {
  constructor() {
    super('Produk tidak ditemukan', 'PRODUCT_NOT_FOUND');
    this.name = 'ProductNotFoundError';
  }
}

export class DifferentStoreError extends CartError {
  constructor(existingStore: string, newStore: string) {
    super(
      `Keranjang hanya bisa berisi produk dari satu toko. Saat ini dari "${existingStore}".`,
      'DIFFERENT_STORE'
    );
    this.name = 'DifferentStoreError';
  }
}

export class InsufficientStockError extends CartError {
  constructor(productName: string, available: number) {
    super(`Stok "${productName}" tidak mencukupi. Tersedia: ${available}.`, 'INSUFFICIENT_STOCK');
    this.name = 'InsufficientStockError';
  }
}

export interface CartWithItems {
  id: string;
  userId: string;
  storeName: string | null;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      discountedPrice: number;
      originalPrice: number;
      stock: number;
      imageUrl: string | null;
      storeName: string;
      isActive: boolean;
    };
  }[];
}

async function getCartOrCreate(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  return cart as CartWithItems;
}

export async function getCart(userId: string): Promise<CartWithItems> {
  return getCartOrCreate(userId);
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity = 1
): Promise<CartWithItems> {
  // Get product with validation
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    throw new ProductNotFoundError();
  }

  // Get or create cart
  const cart = await getCartOrCreate(userId);

  // Enforce single-store constraint
  if (cart.storeName && cart.storeName !== product.storeName) {
    throw new DifferentStoreError(cart.storeName, product.storeName);
  }

  // Check stock - existing quantity + new quantity
  const existingItem = cart.items.find((i) => i.productId === productId);
  const currentQty = existingItem?.quantity ?? 0;
  const newTotalQty = currentQty + quantity;

  if (newTotalQty > product.stock) {
    throw new InsufficientStockError(product.name, product.stock);
  }

  // Upsert cart item
  await prisma.cartItem.upsert({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
    },
    update: {
      quantity: newTotalQty,
    },
  });

  // Update storeName on cart if not set
  if (!cart.storeName) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { storeName: product.storeName },
    });
  }

  // Return updated cart
  return getCartOrCreate(userId);
}

export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartWithItems> {
  // If quantity < 1, remove item instead
  if (quantity < 1) {
    return removeFromCart(userId, productId);
  }

  const cart = await getCartOrCreate(userId);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ProductNotFoundError();
  }

  // Check stock
  if (quantity > product.stock) {
    throw new InsufficientStockError(product.name, product.stock);
  }

  // Update quantity
  await prisma.cartItem.update({
    where: {
      cartId_productId: { cartId: cart.id, productId },
    },
    data: { quantity },
  });

  return getCartOrCreate(userId);
}

export async function removeFromCart(
  userId: string,
  productId: string
): Promise<CartWithItems> {
  const cart = await getCartOrCreate(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  // Check if cart is now empty and clear storeName
  const remainingItems = await prisma.cartItem.count({
    where: { cartId: cart.id },
  });

  if (remainingItems === 0) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { storeName: null },
    });
  }

  return getCartOrCreate(userId);
}

export async function clearCart(userId: string): Promise<void> {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: { storeName: null },
  });
}
