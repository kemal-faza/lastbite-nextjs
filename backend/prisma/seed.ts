import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo MITRA user
  const { default: bcrypt } = await import("bcryptjs");

  const mitraEmail = "mitra@lastbite.id";
  let mitra = await prisma.user.findUnique({ where: { email: mitraEmail } });

  if (!mitra) {
    const passwordHash = await bcrypt.hash("password123", 10);
    mitra = await prisma.user.create({
      data: {
        email: mitraEmail,
        name: "Mitra LastBite",
        phone: "081234567890",
        role: "MITRA",
        passwordHash,
        isVerified: true,
      },
    });
    console.log(`Created MITRA user: ${mitra.email}`);
  } else {
    console.log(`MITRA user already exists: ${mitra.email}`);
  }

  // Delete existing products
  await prisma.product.deleteMany();
  console.log("Cleared existing products");

  // Seed products
  const products = [
    {
      name: "Ayam Preksu",
      description:
        "Ayam geprek pedas dengan sambal bawang khas, dilengkapi lalapan segar dan nasi putih hangat. Paket hemat untuk makan siang!",
      category: "meals" as Category,
      originalPrice: 25000,
      discountedPrice: 15000,
      stock: 5,
      imageUrl: "/images/products/ayam-preksu.jpg",
      storeName: "Dapur Bu Ani",
      storeAddress: "Jl. Merdeka No. 12, Bandung",
      storeLat: -6.914744,
      storeLng: 107.60981,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      mitraId: mitra.id,
    },
    {
      name: "Nasi Padang",
      description:
        "Paket nasi padang lengkap dengan rendang, ayak pop, sambal lado, dan sayur nangka. Porsi besar!",
      category: "meals" as Category,
      originalPrice: 35000,
      discountedPrice: 25000,
      stock: 3,
      imageUrl: "/images/products/nasi-padang.jpg",
      storeName: "RM Padang Suharti",
      storeAddress: "Jl. Diponegoro No. 45, Bandung",
      storeLat: -6.902425,
      storeLng: 107.618756,
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      mitraId: mitra.id,
    },
    {
      name: "Roti Coklat",
      description:
        "Roti empuk isi coklat meleleh, fresh from the oven. Cocok untuk teman ngopi sore!",
      category: "bakery" as Category,
      originalPrice: 15000,
      discountedPrice: 8000,
      stock: 8,
      imageUrl: "/images/products/roti-coklat.jpg",
      storeName: "Bakeria",
      storeAddress: "Jl. Braga No. 78, Bandung",
      storeLat: -6.916105,
      storeLng: 107.609536,
      expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
      mitraId: mitra.id,
    },
    {
      name: "Kopi Susu Gula Aren",
      description:
        "Kopi susu kekinian dengan gula aren asli, menggunakan biji kopi lokal pilihan. Segar!",
      category: "drinks" as Category,
      originalPrice: 22000,
      discountedPrice: 12000,
      stock: 10,
      imageUrl: "/images/products/kopi-susu.jpg",
      storeName: "Warung Kopi Aroma",
      storeAddress: "Jl. Riau No. 23, Bandung",
      storeLat: -6.891542,
      storeLng: 107.610532,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      mitraId: mitra.id,
    },
    {
      name: "Nasi Goreng Kampung",
      description:
        "Nasi goreng kampung dengan bumbu tradisional, telur ceplok, kerupuk, dan acar. Nostalgia!",
      category: "meals" as Category,
      originalPrice: 20000,
      discountedPrice: 13000,
      stock: 6,
      imageUrl: "/images/products/nasgor-kampung.jpg",
      storeName: "Dapur Bu Ani",
      storeAddress: "Jl. Merdeka No. 12, Bandung",
      storeLat: -6.914744,
      storeLng: 107.60981,
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      mitraId: mitra.id,
    },
    {
      name: "Roti Keju",
      description:
        "Roti sobek isi keju mozzarella, dipanggang sempurna. Tekstur lembut dan gurih!",
      category: "bakery" as Category,
      originalPrice: 18000,
      discountedPrice: 10000,
      stock: 7,
      imageUrl: "/images/products/roti-keju.jpg",
      storeName: "Bakeria",
      storeAddress: "Jl. Braga No. 78, Bandung",
      storeLat: -6.916105,
      storeLng: 107.609536,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      mitraId: mitra.id,
    },
    {
      name: "Es Teh Tarik",
      description:
        "Es teh tarik segar dengan foam susu creamy. Minuman pelepas dahaga yang pas!",
      category: "drinks" as Category,
      originalPrice: 12000,
      discountedPrice: 7000,
      stock: 12,
      imageUrl: "/images/products/es-teh-tarik.jpg",
      storeName: "Warung Kopi Aroma",
      storeAddress: "Jl. Riau No. 23, Bandung",
      storeLat: -6.891542,
      storeLng: 107.610532,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      mitraId: mitra.id,
    },
    {
      name: "Mie Ayam Komplit",
      description:
        "Mie ayam dengan topping ayam kecap, pangsit goreng, dan bakso. Porsi lengkap!",
      category: "meals" as Category,
      originalPrice: 20000,
      discountedPrice: 12000,
      stock: 4,
      imageUrl: "/images/products/mie-ayam.jpg",
      storeName: "Mie Ayam Mang Udin",
      storeAddress: "Jl. Cihampelas No. 56, Bandung",
      storeLat: -6.893789,
      storeLng: 107.605432,
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      mitraId: mitra.id,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({ data: product });
    console.log(`  Created product: ${created.name} (Rp${created.discountedPrice})`);
  }

  console.log(`\nSeeded ${products.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
