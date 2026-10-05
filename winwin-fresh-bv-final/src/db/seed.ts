import { db } from "./index";
import { admins, categories, products, deliverySettings, storeSettings } from "./schema";
import bcrypt from "bcryptjs";

const image = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900`;

const pepperImage = image("5701945");
const vegetableImage = image("5622165");
const fruitImage = image("5864769");

const catalog = [
  ["Sivri", "Sivri Pepper", "peppers", 1.19, image("3721695")],
  ["Çarli", "Çarli Pepper", "peppers", 1.19, image("1800247")],
  ["Dolma", "Dolma Pepper", "peppers", 1.19, image("4943441")],
  ["Kapia", "Kapia Pepper", "peppers", 1.39, image("18640811")],
  ["Kıl Sivri biber", "Kıl Sivri Pepper", "peppers", 1.69, image("10682991")],
  ["Kılçık biber", "Kılçık Pepper", "peppers", 1.89, image("4347039")],
  ["Üçburun biber", "Üçburun Pepper", "peppers", 1.59, image("6280412")],
  ["Kırmızı Şili biber", "Red Chili Pepper", "peppers", 1.39, image("15429115")],
  ["Yeşil Şili biber", "Green Chili Pepper", "peppers", 1.19, image("20088835")],
  ["Acı Cin(150g)", "Acı Cin Chili (150g)", "peppers", 0.99, image("31025316")],
  ["Macar", "Macar Pepper", "peppers", 1.49, image("6316520")],
  ["Patlıcan", "Eggplant", "vegetables", 1.69, image("5701950")],
  ["Kabak(D)", "Zucchini (D)", "vegetables", 2.19, image("37160129")],
  ["Mini Kabak(D)", "Mini Zucchini (D)", "vegetables", 2.99, image("36926415")],
  ["Acur", "Acur", "vegetables", 2.79, image("10111495")],
  ["Kelek", "Kelek Melon", "fruit", 2.99, image("9469638")],
  ["Ayşekadin fasulye", "Ayşekadın Green Beans", "vegetables", 2.09, image("30893268")],
  ["Turplar mix", "Mixed Radish", "vegetables", 2.09, image("29181511")],
  ["Balkabağı(BOX-kg)", "Pumpkin (BOX-kg)", "vegetables", 1.29, image("4969890")],
  ["Lahana", "Cabbage", "vegetables", 1.65, image("29679932")],
  ["Kırkağaç", "Kırkağaç Melon", "fruit", 1.39, image("4943057")],
  ["Nektarin", "Nectarine", "fruit", 1.89, image("9810909")],
  ["Ejder(2 li)", "Dragon Fruit (2 pcs)", "fruit", 2.15, image("3691116")],
  ["Ayva", "Quince", "fruit", 2.49, image("9944539")],
  ["St maria", "St. Maria Pear", "fruit", 2.69, image("5713980")],
  ["Deveci armut", "Deveci Pear", "fruit", 2.59, image("10024753")],
  ["Nar (Maat 9/12)", "Pomegranate (Size 9/12)", "fruit", 2.39, image("29310033")],
] as const;

const slugify = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

export async function seedDatabase() {
  console.log("Seeding WIN & WIN FRESH BV database...");

  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword) throw new Error("SEED_ADMIN_PASSWORD is required before running db:seed");
  const seedEmail = process.env.SEED_ADMIN_EMAIL || "admin@winandwinfresh.nl";

  const passwordHash = await bcrypt.hash(seedPassword, 10);
  await db.insert(admins).values({
    email: seedEmail,
    name: "WIN & WIN Super Admin",
    passwordHash,
    role: "super_admin",
  }).onConflictDoNothing();

  // Remove the previous demo catalog. Existing order history stays safe because
  // order_items.product_id uses ON DELETE SET NULL.
  await db.delete(products);
  await db.delete(categories);

  const insertedCategories = await db.insert(categories).values([
    { slug: "peppers", nameNl: "Peppers", nameEn: "Peppers", descriptionNl: "Verse paprika's en pepers.", descriptionEn: "Fresh peppers and chilies.", image: pepperImage, sortOrder: 1, isActive: true },
    { slug: "vegetables", nameNl: "Groenten", nameEn: "Vegetables", descriptionNl: "Dagverse groenten.", descriptionEn: "Fresh vegetables.", image: vegetableImage, sortOrder: 2, isActive: true },
    { slug: "fruit", nameNl: "Fruit", nameEn: "Fruit", descriptionNl: "Vers fruit.", descriptionEn: "Fresh fruit.", image: fruitImage, sortOrder: 3, isActive: true },
  ]).returning();

  const categoryMap = new Map(insertedCategories.map((category) => [category.slug, category.id]));

  await db.insert(products).values(catalog.map(([nameNl, nameEn, category, price, imageUrl], index) => ({
    slug: slugify(nameNl),
    nameNl,
    nameEn,
    descriptionNl: "",
    descriptionEn: "",
    categoryId: categoryMap.get(category),
    // Legacy DB column name is price_per_kg, but the store now treats this as
    // the price of one listed unit/piece.
    pricePerKg: price.toFixed(2),
    salePricePerKg: null,
    unit: "piece",
    mainImage: imageUrl,
    additionalImages: [],
    stockQuantity: "999.00",
    stockStatus: "in_stock",
    origin: "",
    isFeatured: index < 8,
    isSeasonal: false,
    isOrganic: false,
    isNew: false,
    badges: [],
    isPublished: true,
    sortOrder: index + 1,
    nutrition: null,
  })));

  await db.insert(storeSettings).values({
    storeName: "WIN & WIN FRESH BV",
    logoUrl: "/images/logo.svg",
    phone: "+31 20 894 3320",
    email: "info@winandwinfresh.nl",
    address: "Koopliedenweg 14, 1013 AB Amsterdam, Nederland",
    currency: "EUR",
    defaultLanguage: "nl",
  }).onConflictDoNothing();

  await db.insert(deliverySettings).values({
    deliveryFee: "4.95",
    freeDeliveryThreshold: "35.00",
    minOrderValue: "15.00",
    deliveryZones: ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Haarlem", "Almere", "Amstelveen", "Zaandam"],
    deliveryTimeWindow: "Binnen 24-48 uur gekoeld bezorgd",
    deliveryNotesNl: "Gekoelde verslevering rechtstreeks aan uw deur.",
    deliveryNotesEn: "Refrigerated fresh delivery straight to your door.",
  }).onConflictDoNothing();

  console.log(`Database seeded successfully with ${catalog.length} exact catalog products.`);
}

if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
}