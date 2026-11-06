import mongoose from "mongoose";

import config from "../config/config.js";
import Product from "../models/products.js";

const categoryData = {
  "t-shirts": [
    "Organic Cotton Crew Tee",
    "Marlow Relaxed Tee",
    "Linen Blend Resort Tee",
    "Heavyweight Pocket Tee",
    "Ribbed Everyday Tee",
    "Contrast Stitch Tee",
    "Sunwashed Boxy Tee",
    "Pima Cotton Essential Tee",
    "Garment Dyed Tee",
    "Waffle Knit Tee",
    "Weekend Slub Tee",
    "Merino Blend Travel Tee",
    "Bramble Stripe Tee",
    "Heritage Fit Tee",
    "Soft Jersey V-Neck",
    "Canvas Logo Tee",
    "Coastal Breton Tee",
    "Airweight Performance Tee",
    "Relaxed Pocket Tee",
    "Embroidered Garden Tee",
    "Studio Uniform Tee",
    "Recycled Cotton Tee",
    "Washed Indigo Tee",
    "Fine Rib Henley Tee",
    "Essential Longline Tee",
  ],
  hoodies: [
    "Brushed Fleece Pullover",
    "Cloudloop Relaxed Hoodie",
    "Heavyweight Zip Hoodie",
    "Organic Cotton Hoodie",
    "Loopback Terry Hoodie",
    "Alpine Half-Zip Hoodie",
    "Ember Garment Dyed Hoodie",
    "Studio Full-Zip Hoodie",
    "Waffle Texture Hoodie",
    "Raglan Weekend Hoodie",
    "Recycled Fleece Hoodie",
    "Cedar Embroidered Hoodie",
    "French Terry Essential Hoodie",
    "Sherpa Lined Camp Hoodie",
    "Cropped Boxy Hoodie",
    "Midweight Travel Hoodie",
    "Sunfade Pullover Hoodie",
    "Heritage Varsity Hoodie",
    "Thermal Panel Hoodie",
    "Harbor Logo Hoodie",
    "Relaxed Zip-Through Hoodie",
    "Cloud Brushed Hoodie",
    "Utility Pocket Hoodie",
    "Merino Blend Hoodie",
    "Everyday Pullover Hoodie",
  ],
  pants: [
    "Ripstop Utility Trouser",
    "Relaxed Cotton Chino",
    "Canvas Carpenter Pant",
    "Tapered Travel Trouser",
    "Stretch Twill Five-Pocket",
    "Pleated Wool Blend Trouser",
    "Lightweight Cargo Pant",
    "Washed Herringbone Pant",
    "Linen Drawstring Trouser",
    "Corduroy Straight Pant",
    "Recycled Nylon Track Pant",
    "Workwear Painter Pant",
    "Japanese Denim Straight Jean",
    "Soft Jersey Lounge Pant",
    "Cropped Seersucker Trouser",
    "Selvedge Indigo Jean",
    "Double Knee Canvas Pant",
    "Technical Commuter Pant",
    "Wide Leg Pleated Pant",
    "Brushed Cotton Fatigue Pant",
    "Everyday Tapered Chino",
    "Hemp Blend Utility Pant",
    "Corded Work Trouser",
    "Lightweight Resort Pant",
    "Relaxed Linen Blend Pant",
  ],
  shorts: [
    "Everyday Cotton Short",
    "Trail Utility Short",
    "French Terry Lounge Short",
    "Canvas Carpenter Short",
    "Lightweight Run Short",
    "Pleated Linen Short",
    "Swim Ready Board Short",
    "Ripstop Cargo Short",
    "Washed Chino Short",
    "Seersucker Vacation Short",
    "Stretch Denim Short",
    "Recycled Nylon Trail Short",
    "Double Pocket Work Short",
    "Brushed Cotton Camp Short",
    "Jersey Training Short",
    "Corduroy Weekend Short",
    "Relaxed Drawstring Short",
    "Hemp Blend Utility Short",
    "Technical Climbing Short",
    "Garment Dyed Chino Short",
    "Linen Blend Everyday Short",
    "Five-Pocket Canvas Short",
    "Mesh Lined Run Short",
    "Heritage Twill Short",
    "Seaside Stripe Short",
  ],
};

const colors = ["black", "ivory", "sage", "rust", "navy"];
const sizes = ["S", "M", "L", "XL"];
const imageData = {
  "t-shirts": [
    "1521572163474-6864f9cf17ab",
    "1503342217505-b0a15ec3261c",
    "1562157873-818bc0726f68",
    "1581655353564-df123a1eb820",
    "1618354691373-d851c5c3a990",
  ],
  hoodies: [
    "1556821840-3a63f95609a7",
    "1578681994506-b8f463449011",
    "1620799140408-edc6dcb6d633",
    "1551488831-00ddcb6c6bd3",
    "1551488831-00ddcb6c6bd3",
  ],
  pants: [
    "1515886657613-9f3515b0c78f",
    "1473966968600-fa801b869a1a",
    "1542272604-787c3835535d",
    "1515886657613-9f3515b0c78f",
    "1551488831-00ddcb6c6bd3",
  ],
  shorts: [
    "1542272604-787c3835535d",
    "1591195853828-11db59a44f6b",
    "1565084888279-aca607ecce0c",
    "1517836357463-d25dfeac3438",
    "1571945153237-4929e783af4a",
  ],
};

const createProducts = () => {
  const products = [];
  let productNumber = 1;

  for (const [category, names] of Object.entries(categoryData)) {
    for (let index = 0; index < 25; index += 1) {
      const name = names[index];
      const material = name.split(" ").slice(0, 2).join(" ");
      products.push({
        name,
        description: `${material} ${category.replace("-", " ")} with an easy fit and dependable everyday comfort.`,
        price: Number(
          (18 + ((index * 7 + productNumber) % 32) + 0.99).toFixed(2),
        ),
        quantity: 5 + ((index * 3 + productNumber) % 46),
        category,
        colors: [
          colors[index % colors.length],
          colors[(index + 2) % colors.length],
        ],
        sizes: sizes.slice(0, 2 + (index % 3)),
        image: `https://images.unsplash.com/photo-${imageData[category][index % imageData[category].length]}?auto=format&fit=crop&w=900&q=85`,
      });
      productNumber += 1;
    }
  }

  return products;
};

try {
  await mongoose.connect(config.mongoUri);
  await Product.deleteMany({
    $or: [
      { name: /^Test Product \d{3} - / },
      { name: { $in: Object.values(categoryData).flat() } },
    ],
  });
  const products = await Product.insertMany(createProducts());
  console.log(
    `Seeded ${products.length} realistic products across ${Object.keys(categoryData).length} categories.`,
  );
} catch (error) {
  console.error("Product seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
