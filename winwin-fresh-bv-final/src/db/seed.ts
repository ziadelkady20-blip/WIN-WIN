import { db } from "./index";
import {
  admins,
  categories,
  products,
  homepageSections,
  storeSettings,
  deliverySettings,
  promotions,
  coupons,
  orders,
  orderItems,
  customers,
  media
} from "./schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  console.log("Seeding WIN & WIN FRESH BV database...");

  // 1. Admin users
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword) {
    throw new Error("SEED_ADMIN_PASSWORD is required before running db:seed");
  }
  const seedEmail = process.env.SEED_ADMIN_EMAIL || "admin@winandwinfresh.nl";
  const seedName = process.env.SEED_ADMIN_NAME || "WIN & WIN Super Admin";
  const salt = await bcrypt.genSalt(10);
  const superAdminHash = await bcrypt.hash(seedPassword, salt);

  await db.insert(admins).values({
    email: seedEmail,
    name: seedName,
    passwordHash: superAdminHash,
    role: "super_admin",
  }).onConflictDoNothing();

  // 2. Categories
  const insertedCategories = await db.insert(categories).values([
    {
      slug: "groenten",
      nameNl: "Groenten",
      nameEn: "Vegetables",
      descriptionNl: "Dagverse Hollandse en internationale groenten van topkwaliteit.",
      descriptionEn: "Daily fresh Dutch and international premium vegetables.",
      image: "https://images.pexels.com/photos/5677717/pexels-photo-5677717.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      sortOrder: 1,
      isActive: true,
    },
    {
      slug: "fruit",
      nameNl: "Fruit",
      nameEn: "Fruits",
      descriptionNl: "Zoet, sappig handfruit en seizoensgebonden oogst vol vitamines.",
      descriptionEn: "Sweet, juicy hand fruit and seasonal harvests packed with vitamins.",
      image: "https://images.pexels.com/photos/10325095/pexels-photo-10325095.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      sortOrder: 2,
      isActive: true,
    },
    {
      slug: "bladgroenten",
      nameNl: "Bladgroenten & Kruiden",
      nameEn: "Leafy Greens & Herbs",
      descriptionNl: "Kraakverse slasoorten, spinazie en aromatische verse keukenkruiden.",
      descriptionEn: "Crisp salads, baby spinach, and fragrant fresh culinary herbs.",
      image: "https://images.pexels.com/photos/36998708/pexels-photo-36998708.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      sortOrder: 3,
      isActive: true,
    },
    {
      slug: "citrusvruchten",
      nameNl: "Citrusvruchten",
      nameEn: "Citrus Fruits",
      descriptionNl: "Volle perssinaasappels, citroenen, limoenen en mandarijnen vol zonkracht.",
      descriptionEn: "Sun-ripened juicing oranges, lemons, limes, and sweet clementines.",
      image: "https://images.pexels.com/photos/952378/pexels-photo-952378.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      sortOrder: 4,
      isActive: true,
    },
    {
      slug: "exotisch-fruit",
      nameNl: "Exotisch Fruit",
      nameEn: "Exotic Fruits",
      descriptionNl: "Eetrijpe avocado's, mango's, ananas en tropische specialiteiten.",
      descriptionEn: "Ready-to-eat avocados, mangoes, pineapples, and tropical specialities.",
      image: "https://images.pexels.com/photos/5966631/pexels-photo-5966631.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      sortOrder: 5,
      isActive: true,
    },
    {
      slug: "biologisch",
      nameNl: "Biologisch",
      nameEn: "Organic Produce",
      descriptionNl: "100% gecertificeerd biologisch geteelde gewassen zonder bestrijdingsmiddelen.",
      descriptionEn: "100% certified organic produce grown without synthetic pesticides.",
      image: "https://images.pexels.com/photos/39566593/pexels-photo-39566593.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      sortOrder: 6,
      isActive: true,
    },
  ]).onConflictDoNothing().returning();

  // Fetch category IDs
  const allCats = await db.select().from(categories);
  const catMap = new Map(allCats.map(c => [c.slug, c.id]));

  // 3. Products
  const seedProducts: (typeof products.$inferInsert)[] = [
    {
      slug: "trostomaten-holland",
      nameNl: "Hollandse Trostomaten",
      nameEn: "Dutch Vine Tomatoes",
      descriptionNl: "Rijk van smaak, stevig vruchtvlees en intens aroma. Direct van telers uit het Westland. Perfect voor salades, soepen en pastasauzen.",
      descriptionEn: "Rich flavor, firm texture, and intense aroma. Sourced directly from Westland growers. Ideal for fresh salads, soups, and pasta sauces.",
      categoryId: catMap.get("groenten"),
      pricePerKg: "2.49",
      salePricePerKg: "1.99",
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/10112724/pexels-photo-10112724.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/34635764/pexels-photo-34635764.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        "https://images.pexels.com/photos/16701788/pexels-photo-16701788.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "250.00",
      stockStatus: "in_stock",
      origin: "Westland, Nederland",
      isFeatured: true,
      isSeasonal: false,
      isOrganic: false,
      isNew: false,
      badges: ["SALE", "POPULAR"],
      isPublished: true,
      sortOrder: 1,
      nutrition: { "Energie": "18 kcal / 100g", "Vitamine C": "14 mg", "Koolhydraten": "3.9 g", "Vezels": "1.2 g" }
    },
    {
      slug: "knapperige-komkommer",
      nameNl: "Knapperige Hollandse Komkommer",
      nameEn: "Crisp Dutch Cucumber",
      descriptionNl: "Altijd supervers, verfrissend knapperig en vol vocht. Duurzaam geteeld in Nederlandse kassen met biologische gewasbescherming.",
      descriptionEn: "Consistently fresh, refreshingly crisp, and hydrating. Sustainably greenhouse-grown in the Netherlands.",
      categoryId: catMap.get("groenten"),
      pricePerKg: "1.49",
      salePricePerKg: null,
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/39552264/pexels-photo-39552264.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/7543151/pexels-photo-7543151.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "180.00",
      stockStatus: "in_stock",
      origin: "Zuid-Holland, Nederland",
      isFeatured: true,
      isSeasonal: false,
      isOrganic: false,
      isNew: false,
      badges: ["POPULAR"],
      isPublished: true,
      sortOrder: 2,
      nutrition: { "Energie": "15 kcal / 100g", "Watergehalte": "95%", "Vitamine K": "16 µg" }
    },
    {
      slug: "bospeen-met-loof",
      nameNl: "Verse Bospeen met Groen Loof",
      nameEn: "Fresh Bunch Carrots with Greens",
      descriptionNl: "Heerlijk zoete jonge wortelen met frisgroen loof. Knapperig en sappig, ideaal om rauw te snacken of te roosteren in de oven met tijm en honing.",
      descriptionEn: "Delightfully sweet tender young carrots with crisp green tops. Perfect for snacking raw or roasting with thyme and wildflower honey.",
      categoryId: catMap.get("groenten"),
      pricePerKg: "1.89",
      salePricePerKg: null,
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/2914749/pexels-photo-2914749.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/10487659/pexels-photo-10487659.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "210.00",
      stockStatus: "in_stock",
      origin: "Flevoland, Nederland",
      isFeatured: false,
      isSeasonal: true,
      isOrganic: false,
      isNew: false,
      badges: ["SEASONAL"],
      isPublished: true,
      sortOrder: 3,
      nutrition: { "Energie": "41 kcal / 100g", "Bèta-caroteen": "8285 µg", "Vezels": "2.8 g" }
    },
    {
      slug: "kroonbroccoli-bio",
      nameNl: "Biologische Verse Kroonbroccoli",
      nameEn: "Organic Fresh Crown Broccoli",
      descriptionNl: "Stevige diepgroene roosjes met een milde aardse smaak. Rijk aan sulforafaan, vitamine K en foliumzuur. 100% biologisch geteeld.",
      descriptionEn: "Firm, deep-emerald florets with a delicate earthy sweetness. Rich in sulforaphane, vitamin K, and folic acid. 100% certified organic.",
      categoryId: catMap.get("biologisch"),
      pricePerKg: "2.89",
      salePricePerKg: "2.39",
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/10862299/pexels-photo-10862299.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/4162156/pexels-photo-4162156.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "95.00",
      stockStatus: "in_stock",
      origin: "Noord-Holland, Nederland",
      isFeatured: true,
      isSeasonal: false,
      isOrganic: true,
      isNew: false,
      badges: ["ORGANIC", "SALE"],
      isPublished: true,
      sortOrder: 4,
      nutrition: { "Energie": "34 kcal / 100g", "Vitamine C": "89 mg", "Proteïne": "2.8 g" }
    },
    {
      slug: "elstar-appels",
      nameNl: "Elstar Handappels van de Betuwe",
      nameEn: "Dutch Elstar Apples from Betuwe",
      descriptionNl: "De absolute favoriet van Nederland: friszoet met een zachte zuurgraad en een knapperige beet. Gewaardeerd door fijnproevers en kinderen.",
      descriptionEn: "The undisputed Dutch favorite: crisp, sweet-tangy flavor with aromatic juiciness. Hand-picked in the historic orchards of Betuwe.",
      categoryId: catMap.get("fruit"),
      pricePerKg: "2.59",
      salePricePerKg: "2.19",
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/10256309/pexels-photo-10256309.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/135130/pexels-photo-135130.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "320.00",
      stockStatus: "in_stock",
      origin: "Betuwe, Nederland",
      isFeatured: true,
      isSeasonal: true,
      isOrganic: false,
      isNew: false,
      badges: ["POPULAR", "SEASONAL"],
      isPublished: true,
      sortOrder: 5,
      nutrition: { "Energie": "52 kcal / 100g", "Suikers": "10 g", "Vezels": "2.4 g" }
    },
    {
      slug: "premium-bananen",
      nameNl: "Fairtrade Cavendish Bananen",
      nameEn: "Fairtrade Cavendish Bananas",
      descriptionNl: "Zorgvuldig gerijpt tot de perfecte goudgele kleur. Romig van smaak, rijk aan kalium en natuurlijke energie voor het hele gezin.",
      descriptionEn: "Carefully ripened to golden perfection. Creamy texture, rich in potassium and sustained natural energy for the entire household.",
      categoryId: catMap.get("fruit"),
      pricePerKg: "1.89",
      salePricePerKg: null,
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/10899478/pexels-photo-10899478.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/30558166/pexels-photo-30558166.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "280.00",
      stockStatus: "in_stock",
      origin: "Ecuador (Fairtrade)",
      isFeatured: false,
      isSeasonal: false,
      isOrganic: false,
      isNew: false,
      badges: ["POPULAR"],
      isPublished: true,
      sortOrder: 6,
      nutrition: { "Energie": "89 kcal / 100g", "Kalium": "358 mg", "Vitamine B6": "0.4 mg" }
    },
    {
      slug: "perssinaasappels-valencia",
      nameNl: "Zoete Valencia Perssinaasappels",
      nameEn: "Sweet Valencia Juicing Oranges",
      descriptionNl: "Uitzonderlijk sappig met een hoog suikergehalte en dunne schil. Eén kilogram levert ruim twee grote glazen versgeperst puur sap op.",
      descriptionEn: "Exceptionally juicy with high natural sugar content and thin skin. One kilogram yields over two generous glasses of fresh morning juice.",
      categoryId: catMap.get("citrusvruchten"),
      pricePerKg: "2.39",
      salePricePerKg: null,
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/1352241/pexels-photo-1352241.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/952378/pexels-photo-952378.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "350.00",
      stockStatus: "in_stock",
      origin: "Valencia, Spanje",
      isFeatured: true,
      isSeasonal: false,
      isOrganic: false,
      isNew: false,
      badges: ["POPULAR"],
      isPublished: true,
      sortOrder: 7,
      nutrition: { "Energie": "47 kcal / 100g", "Vitamine C": "53 mg", "Foliumzuur": "30 µg" }
    },
    {
      slug: "hollandse-aardbeien",
      nameNl: "Hollandse Zomer Aardbeien",
      nameEn: "Dutch Sweet Summer Strawberries",
      descriptionNl: "Het kroonjuweel van het Nederlandse fruitseizoen. Dieprood gerijpt aan de plant, onweerstaanbaar zoet en geurend.",
      descriptionEn: "The crown jewel of the Dutch berry harvest. Sun-ripened on the vine, irresistibly sweet and aromatic.",
      categoryId: catMap.get("fruit"),
      pricePerKg: "5.49",
      salePricePerKg: "4.89",
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/12003833/pexels-photo-12003833.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/8262873/pexels-photo-8262873.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "120.00",
      stockStatus: "in_stock",
      origin: "Brabant, Nederland",
      isFeatured: true,
      isSeasonal: true,
      isOrganic: false,
      isNew: true,
      badges: ["NEW", "SEASONAL", "SALE"],
      isPublished: true,
      sortOrder: 8,
      nutrition: { "Energie": "32 kcal / 100g", "Vitamine C": "58 mg", "Antioxidanten": "Hoog" }
    },
    {
      slug: "eetrijpe-hass-avocado",
      nameNl: "Eetrijpe Hass Avocado's",
      nameEn: "Ready-to-Eat Hass Avocado",
      descriptionNl: "Zijdezacht en nootachtig van smaak. Perfect rijp voor guacamole, toast of salade. Rijk aan gezonde onverzadigde vetten.",
      descriptionEn: "Velvety, nutty, and perfectly ripe. Ready for gourmet toast, fresh salads, or creamy guacamole. Rich in healthy monounsaturated fats.",
      categoryId: catMap.get("exotisch-fruit"),
      pricePerKg: "3.95",
      salePricePerKg: null,
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/5966631/pexels-photo-5966631.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/3850662/pexels-photo-3850662.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "140.00",
      stockStatus: "in_stock",
      origin: "Peru",
      isFeatured: true,
      isSeasonal: false,
      isOrganic: false,
      isNew: false,
      badges: ["POPULAR"],
      isPublished: true,
      sortOrder: 9,
      nutrition: { "Energie": "160 kcal / 100g", "Gezonde Vetten": "15 g", "Vezels": "6.7 g" }
    },
    {
      slug: "paprika-mix-trio",
      nameNl: "Kleurrijke Paprika Mix (Rood/Geel/Groen)",
      nameEn: "Colorful Bell Pepper Trio (Red/Yellow/Green)",
      descriptionNl: "Vlezige en zoete paprika's in levendige kleuren. Prachtig op het bord, rijk aan bètacaroteen en dubbel zoveel vitamine C als een sinaasappel.",
      descriptionEn: "Plump, sweet bell peppers in vibrant festive colors. Packed with vitamin C, sweet crunch, and culinary versatility.",
      categoryId: catMap.get("groenten"),
      pricePerKg: "2.89",
      salePricePerKg: null,
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/7543199/pexels-photo-7543199.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/39648120/pexels-photo-39648120.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "160.00",
      stockStatus: "in_stock",
      origin: "Westland, Nederland",
      isFeatured: false,
      isSeasonal: false,
      isOrganic: false,
      isNew: false,
      badges: ["POPULAR"],
      isPublished: true,
      sortOrder: 10,
      nutrition: { "Energie": "26 kcal / 100g", "Vitamine C": "127 mg", "Vezels": "2.1 g" }
    },
    {
      slug: "kastanjechampignons",
      nameNl: "Verse Kastanjechampignons",
      nameEn: "Fresh Brown Chestnut Mushrooms",
      descriptionNl: "Stevige structuur met een nootachtige en diepe umamismaak. Bevatten minder vocht dan witte champignons en bakken prachtig goudbruin.",
      descriptionEn: "Firm texture with a rich, nutty umami flavor. Lower water content than white button mushrooms for excellent sautéing and caramelization.",
      categoryId: catMap.get("biologisch"),
      pricePerKg: "3.49",
      salePricePerKg: "2.99",
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/16732696/pexels-photo-16732696.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/33654806/pexels-photo-33654806.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "80.00",
      stockStatus: "in_stock",
      origin: "Brabant, Nederland",
      isFeatured: false,
      isSeasonal: true,
      isOrganic: true,
      isNew: false,
      badges: ["ORGANIC", "SALE"],
      isPublished: true,
      sortOrder: 11,
      nutrition: { "Energie": "22 kcal / 100g", "Vitamine D": "Zonbelicht", "Proteïne": "3.1 g" }
    },
    {
      slug: "verse-botersla",
      nameNl: "Hollandse Kropsla & Veldsla",
      nameEn: "Dutch Crisp Butterhead & Lamb's Lettuce",
      descriptionNl: "Zachte malse bladeren met een subtiele milde botersmaak. Dagelijks geoogst en dezelfde ochtend geleverd voor maximale knapperigheid.",
      descriptionEn: "Tender, delicate leaves with a mild, buttery flavor. Harvested daily and dispatched the same morning for peak garden-fresh crispness.",
      categoryId: catMap.get("bladgroenten"),
      pricePerKg: "1.79",
      salePricePerKg: null,
      unit: "kg",
      mainImage: "https://images.pexels.com/photos/36998708/pexels-photo-36998708.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      additionalImages: [
        "https://images.pexels.com/photos/8845416/pexels-photo-8845416.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      ],
      stockQuantity: "110.00",
      stockStatus: "in_stock",
      origin: "Westland, Nederland",
      isFeatured: false,
      isSeasonal: false,
      isOrganic: false,
      isNew: false,
      badges: ["POPULAR"],
      isPublished: true,
      sortOrder: 12,
      nutrition: { "Energie": "14 kcal / 100g", "Vitamine A": "166 µg", "Foliumzuur": "38 µg" }
    },
  ];

  for (const prod of seedProducts) {
    await db.insert(products).values(prod).onConflictDoNothing();
  }

  // 4. Homepage Sections (Editable CMS)
  await db.insert(homepageSections).values([
    {
      sectionType: "hero",
      titleNl: "Verse groenten en fruit, elke dag de beste kwaliteit",
      titleEn: "Fresh fruits and vegetables, the best quality every day",
      subtitleNl: "Zorgvuldig geselecteerd van toonaangevende telers, rechtstreeks en gekoeld bezorgd in heel Nederland.",
      subtitleEn: "Carefully selected from prime growers, delivered refrigerated directly to your doorstep across the Netherlands.",
      imageUrl: "https://images.pexels.com/photos/12932209/pexels-photo-12932209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
      buttonTextNl: "Bekijk producten",
      buttonTextEn: "Shop Products",
      buttonLink: "/shop",
      sortOrder: 1,
      isActive: true,
    },
    {
      sectionType: "features",
      titleNl: "Waarom kiezen voor WIN & WIN FRESH BV",
      titleEn: "Why Choose WIN & WIN FRESH BV",
      subtitleNl: "Nederlandse betrouwbaarheid, pure versheid",
      subtitleEn: "Dutch reliability, pure garden freshness",
      sortOrder: 2,
      isActive: true,
      config: {
        items: [
          {
            titleNl: "Verse Kwaliteit",
            titleEn: "Fresh Quality",
            descNl: "Dagelijks vers ingekocht op de veiling en rechtstreeks van Nederlandse telers.",
            descEn: "Sourced daily directly from Dutch auction floors and premium grower greenhouses."
          },
          {
            titleNl: "Zorgvuldig Geselecteerd",
            titleEn: "Carefully Selected",
            descNl: "Elk stuk groente en fruit wordt handmatig gekeurd op rijpheid en smaak.",
            descEn: "Every piece of produce is manually inspected for ripeness, aroma, and texture."
          },
          {
            titleNl: "Breed Assortiment",
            titleEn: "Wide Assortment",
            descNl: "Van oer-Hollandse seizoensgroenten tot exotisch kwaliteitsfruit per kilo.",
            descEn: "From authentic Dutch seasonal staples to pristine tropical exotic fruits."
          },
          {
            titleNl: "Gekoelde Bezorging",
            titleEn: "Reliable Cold-Chain",
            descNl: "Vakkundig verpakt en in gekoelde bussen aan uw deur geleverd.",
            descEn: "Professionally packaged and delivered in temperature-controlled vans."
          }
        ]
      }
    },
    {
      sectionType: "categories",
      titleNl: "Ontdek Onze Categorieën",
      titleEn: "Explore Our Categories",
      subtitleNl: "Vind eenvoudig de lekkerste seizoensoogst en dagelijkse basisproducten",
      subtitleEn: "Easily discover top seasonal harvests and everyday wholesome staples",
      buttonTextNl: "Alle categorieën bekijken",
      buttonTextEn: "View All Categories",
      buttonLink: "/categories",
      sortOrder: 3,
      isActive: true,
    },
    {
      sectionType: "featured_products",
      titleNl: "Uitgelichte Favorieten",
      titleEn: "Featured Favorites",
      subtitleNl: "Onze populairste versproducten van deze week, gekozen door onze meester-inkopers.",
      subtitleEn: "Our most popular fresh items of the week, curated by our expert produce buyers.",
      buttonTextNl: "Bekijk alle favorieten",
      buttonTextEn: "View All Favorites",
      buttonLink: "/shop?filter=featured",
      sortOrder: 4,
      isActive: true,
    },
    {
      sectionType: "special_offers",
      titleNl: "Wekelijkse Voordeelaanbiedingen",
      titleEn: "Weekly Special Offers",
      subtitleNl: "Geniet van uitzonderlijke prijzen per kilo op onze geselecteerde versaanbiedingen.",
      subtitleEn: "Enjoy exceptional per-kilogram prices on our hand-selected fresh weekly deals.",
      buttonTextNl: "Naar alle aanbiedingen",
      buttonTextEn: "View All Special Offers",
      buttonLink: "/shop?filter=sale",
      sortOrder: 5,
      isActive: true,
    },
    {
      sectionType: "seasonal_products",
      titleNl: "Vers van het Seizoen",
      titleEn: "Fresh This Season",
      subtitleNl: "Het allerbeste wat de natuur en de Nederlandse grond op dit moment te bieden hebben.",
      subtitleEn: "The very finest produce nature and fertile Dutch soil have to offer right now.",
      buttonTextNl: "Ontdek het seizoen",
      buttonTextEn: "Discover Seasonal Harvest",
      buttonLink: "/shop?filter=seasonal",
      sortOrder: 6,
      isActive: true,
    },
    {
      sectionType: "about",
      titleNl: "Het Verhaal achter WIN & WIN FRESH BV",
      titleEn: "The Story Behind WIN & WIN FRESH BV",
      subtitleNl: "Al generaties lang een passie voor puur en eerlijk eten",
      subtitleEn: "A generational dedication to wholesome, pure, and honest produce",
      contentNl: "WIN & WIN FRESH BV is gevestigd in Nederland en levert al jarenlang groenten en fruit van het allerhoogste kaliber aan particulieren en horeca. Wij geloven in korte ketens: hoe sneller de oogst van het land naar uw keuken reist, des te rijker de smaak en hoe meer vitamines behouden blijven. Wij behandelen onze telers eerlijk en onze klanten met koninklijke service.",
      contentEn: "WIN & WIN FRESH BV is proudly headquartered in the Netherlands, supplying top-tier fruits and vegetables to households and gastronomy. We believe in short supply chains: the faster produce travels from farm to kitchen, the richer the taste and the more vital nutrients are preserved. We treat our growers fairly and our clients with royal dedication.",
      imageUrl: "https://images.pexels.com/photos/5677717/pexels-photo-5677717.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
      buttonTextNl: "Lees meer over ons",
      buttonTextEn: "Read Our Full Story",
      buttonLink: "/about",
      sortOrder: 7,
      isActive: true,
    },
    {
      sectionType: "quality",
      titleNl: "Onze Belofte van Versheid & Betrouwbaarheid",
      titleEn: "Our Freshness & Quality Promise",
      subtitleNl: "100% tevredenheidsgarantie bij elke bestelling",
      subtitleEn: "100% satisfaction guarantee on every single delivery",
      contentNl: "Elke ochtend vóór zonsopgang inspecteren onze keurmeesters de binnengekomen partijen. Wat niet aan onze strenge maatstaven voldoet, komt simpelweg niet in uw krat terecht.",
      contentEn: "Every morning before sunrise, our inspectors examine incoming harvests. Anything that falls short of our rigorous standards never makes it into your box.",
      sortOrder: 8,
      isActive: true,
    },
    {
      sectionType: "delivery",
      titleNl: "Gekoelde Bezorging & Eenvoudig Bestellen",
      titleEn: "Cold-Chain Delivery & Frictionless Ordering",
      subtitleNl: "Geen account nodig • Gratis bezorging vanaf €35,- • Betaling bij levering",
      subtitleEn: "No account required • Free delivery from €35 • Clear payment on delivery",
      contentNl: "Plaats uw bestelling binnen 2 minuten als gast. Onze gekoelde bestelwagens leveren uw verse groenten en fruit rechtstreeks af op uw gewenste adres in optimale conditie.",
      contentEn: "Place your order in under 2 minutes as a guest. Our temperature-controlled delivery vans deliver fresh produce right to your door in peak condition.",
      sortOrder: 9,
      isActive: true,
      buttonTextNl: "Bestel Nu Direct",
      buttonTextEn: "Order Now Directly",
      buttonLink: "/shop"
    },
    {
      sectionType: "newsletter",
      titleNl: "Blijf op de hoogte van verse oogsten & acties",
      titleEn: "Stay Updated on Fresh Harvests & Offers",
      subtitleNl: "Ontvang wekelijks onze vers-update en exclusieve seizoensaanbiedingen.",
      subtitleEn: "Receive our weekly harvest bulletin and exclusive seasonal deals.",
      sortOrder: 10,
      isActive: true,
    }
  ]).onConflictDoNothing();

  // 5. Store Settings
  await db.insert(storeSettings).values({
    storeName: "WIN & WIN FRESH BV",
    logoUrl: "/images/logo.svg",
    phone: "+31 20 894 3320",
    email: "info@winandwinfresh.nl",
    address: "Koopliedenweg 14, 1013 AB Amsterdam, Nederland",
    kvkNumber: "87492011",
    vatNumber: "NL864321908B01",
    openingHoursNl: "Maandag - Zaterdag: 07:00 - 18:00 (Zondag gesloten)",
    openingHoursEn: "Monday - Saturday: 07:00 - 18:00 (Sunday closed)",
    currency: "EUR",
    defaultLanguage: "nl",
    whatsappNumber: "+31612345678",
    instagramUrl: "https://instagram.com/winandwinfresh",
    facebookUrl: "https://facebook.com/winandwinfresh",
  }).onConflictDoNothing();

  // 6. Delivery Settings
  await db.insert(deliverySettings).values({
    deliveryFee: "4.95",
    freeDeliveryThreshold: "35.00",
    minOrderValue: "15.00",
    deliveryZones: [
      "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Haarlem", "Almere", "Amstelveen", "Zaandam", "Leiden", "Delft"
    ],
    deliveryTimeWindow: "Binnen 24-48 uur gekoeld bezorgd (Ma t/m Za)",
    deliveryNotesNl: "Gekoelde bezorging direct aan de deur. Bestel voor 23:00 voor levering de volgende werkdag.",
    deliveryNotesEn: "Refrigerated delivery straight to your door. Order before 23:00 for next business day delivery.",
  }).onConflictDoNothing();

  // 7. Promotions
  await db.insert(promotions).values([
    {
      titleNl: "Zomer Aardbeien & Trostomaten Voordeelweek",
      titleEn: "Summer Strawberry & Vine Tomato Week",
      descriptionNl: "Tot 20% voordeel op geselecteerde verse oogst uit Nederlandse kassen.",
      descriptionEn: "Up to 20% off selected fresh harvest from premier Dutch greenhouses.",
      promoBadge: "VERS VOORDEEL",
      discountPercentage: "20.00",
      isActive: true,
      linkUrl: "/shop?filter=sale",
    },
    {
      titleNl: "Gratis Gekoelde Bezorging vanaf €35,-",
      titleEn: "Free Refrigerated Delivery on orders over €35",
      descriptionNl: "Vul uw voorraad aan met onze biologische groenten en fruit en betaal geen verzendkosten.",
      descriptionEn: "Stock up on organic produce and enjoy complimentary refrigerated shipping.",
      promoBadge: "GRATIS BEZORGD",
      isActive: true,
      linkUrl: "/shop",
    }
  ]).onConflictDoNothing();

  // 8. Coupons
  await db.insert(coupons).values([
    {
      code: "VERS10",
      discountType: "percentage",
      discountValue: "10.00",
      minOrderAmount: "25.00",
      maxUses: 100,
      usedCount: 14,
      isActive: true,
    },
    {
      code: "WELKOM5",
      discountType: "fixed",
      discountValue: "5.00",
      minOrderAmount: "30.00",
      maxUses: 50,
      usedCount: 8,
      isActive: true,
    }
  ]).onConflictDoNothing();

  // 9. Customers
  const customerList = [
    {
      name: "Daan van Dijk",
      email: "daan.vandijk@example.nl",
      phone: "+31 6 1234 5678",
      totalOrders: 3,
      totalSpent: "114.50",
      notes: "Vaste klant in Amsterdam-Zuid. Graag bellen voor aanbellen."
    },
    {
      name: "Emma Brouwer",
      email: "emma.brouwer@example.com",
      phone: "+31 6 8765 4321",
      totalOrders: 2,
      totalSpent: "78.20",
      notes: "Liefhebber van biologische producten."
    },
    {
      name: "Lucas Meijer",
      email: "lucas.meijer@example.nl",
      phone: "+31 6 4567 8901",
      totalOrders: 1,
      totalSpent: "42.90",
      notes: "Nieuwe klant, Utrecht centrum."
    }
  ];

  for (const c of customerList) {
    await db.insert(customers).values(c).onConflictDoNothing();
  }

  // 10. Sample Orders
  const order1 = await db.insert(orders).values({
    orderNumber: "WWF-2026-1001",
    customerName: "Daan van Dijk",
    customerEmail: "daan.vandijk@example.nl",
    customerPhone: "+31 6 1234 5678",
    street: "Keizersgracht",
    houseNumber: "412",
    postalCode: "1016 EK",
    city: "Amsterdam",
    country: "Nederland",
    addressExtra: "2 hoog",
    orderNotes: "Graag bij buren op nr 410 afgeven indien niet thuis.",
    status: "delivered",
    subtotal: "38.50",
    deliveryFee: "0.00",
    discountAmount: "3.85",
    couponCode: "VERS10",
    total: "34.65",
    paymentStatus: "paid_on_delivery",
    paymentMethod: "on_delivery",
  }).onConflictDoNothing().returning();

  if (order1[0]) {
    await db.insert(orderItems).values([
      {
        orderId: order1[0].id,
        productName: "Hollandse Trostomaten",
        pricePerUnit: "1.99",
        quantity: "3.00",
        unit: "kg",
        totalPrice: "5.97",
        productImage: "https://images.pexels.com/photos/10112724/pexels-photo-10112724.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      },
      {
        orderId: order1[0].id,
        productName: "Elstar Handappels van de Betuwe",
        pricePerUnit: "2.19",
        quantity: "4.00",
        unit: "kg",
        totalPrice: "8.76",
        productImage: "https://images.pexels.com/photos/10256309/pexels-photo-10256309.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      },
      {
        orderId: order1[0].id,
        productName: "Hollandse Zomer Aardbeien",
        pricePerUnit: "4.89",
        quantity: "2.00",
        unit: "kg",
        totalPrice: "9.78",
        productImage: "https://images.pexels.com/photos/12003833/pexels-photo-12003833.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      },
      {
        orderId: order1[0].id,
        productName: "Eetrijpe Hass Avocado's",
        pricePerUnit: "3.95",
        quantity: "3.50",
        unit: "kg",
        totalPrice: "13.83",
        productImage: "https://images.pexels.com/photos/5966631/pexels-photo-5966631.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      }
    ]);
  }

  const order2 = await db.insert(orders).values({
    orderNumber: "WWF-2026-1002",
    customerName: "Emma Brouwer",
    customerEmail: "emma.brouwer@example.com",
    customerPhone: "+31 6 8765 4321",
    street: "Maliebaan",
    houseNumber: "78",
    postalCode: "3581 CV",
    city: "Utrecht",
    country: "Nederland",
    orderNotes: "Plaats de kist alstublieft op de veranda.",
    status: "under_review",
    subtotal: "42.10",
    deliveryFee: "0.00",
    discountAmount: "0.00",
    total: "42.10",
    paymentStatus: "pending_on_delivery",
    paymentMethod: "on_delivery",
  }).onConflictDoNothing().returning();

  if (order2[0]) {
    await db.insert(orderItems).values([
      {
        orderId: order2[0].id,
        productName: "Biologische Verse Kroonbroccoli",
        pricePerUnit: "2.39",
        quantity: "3.00",
        unit: "kg",
        totalPrice: "7.17",
        productImage: "https://images.pexels.com/photos/10862299/pexels-photo-10862299.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      },
      {
        orderId: order2[0].id,
        productName: "Zoete Valencia Perssinaasappels",
        pricePerUnit: "2.39",
        quantity: "5.00",
        unit: "kg",
        totalPrice: "11.95",
        productImage: "https://images.pexels.com/photos/1352241/pexels-photo-1352241.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      },
      {
        orderId: order2[0].id,
        productName: "Verse Kastanjechampignons",
        pricePerUnit: "2.99",
        quantity: "2.50",
        unit: "kg",
        totalPrice: "7.48",
        productImage: "https://images.pexels.com/photos/16732696/pexels-photo-16732696.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      },
      {
        orderId: order2[0].id,
        productName: "Verse Bospeen met Groen Loof",
        pricePerUnit: "1.89",
        quantity: "3.00",
        unit: "kg",
        totalPrice: "5.67",
        productImage: "https://images.pexels.com/photos/2914749/pexels-photo-2914749.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      },
      {
        orderId: order2[0].id,
        productName: "Knapperige Hollandse Komkommer",
        pricePerUnit: "1.49",
        quantity: "4.00",
        unit: "kg",
        totalPrice: "5.96",
        productImage: "https://images.pexels.com/photos/39552264/pexels-photo-39552264.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
      }
    ]);
  }

  // 11. Media entries for media library
  await db.insert(media).values([
    {
      name: "trostomaten-westland.jpg",
      url: "https://images.pexels.com/photos/10112724/pexels-photo-10112724.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      folder: "products",
      size: 482000,
      mimeType: "image/jpeg",
      altNl: "Hollandse trostomaten van het Westland",
      altEn: "Dutch vine tomatoes from Westland"
    },
    {
      name: "elstar-appels.jpg",
      url: "https://images.pexels.com/photos/10256309/pexels-photo-10256309.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      folder: "products",
      size: 512000,
      mimeType: "image/jpeg",
      altNl: "Knapperige Elstar appels uit de Betuwe",
      altEn: "Crisp Dutch Elstar apples from Betuwe"
    },
    {
      name: "aardbeien-brabant.jpg",
      url: "https://images.pexels.com/photos/12003833/pexels-photo-12003833.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      folder: "products",
      size: 610000,
      mimeType: "image/jpeg",
      altNl: "Hollandse verse aardbeien",
      altEn: "Fresh Dutch strawberries"
    },
    {
      name: "hero-vers-assortiment.jpg",
      url: "https://images.pexels.com/photos/12932209/pexels-photo-12932209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
      folder: "homepage",
      size: 940000,
      mimeType: "image/jpeg",
      altNl: "Hero afbeelding verse groenten en fruit",
      altEn: "Hero image fresh produce assortment"
    },
    {
      name: "groenten-krat.jpg",
      url: "https://images.pexels.com/photos/5677717/pexels-photo-5677717.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
      folder: "categories",
      size: 520000,
      mimeType: "image/jpeg",
      altNl: "Vers geoogste groenten",
      altEn: "Freshly harvested vegetables"
    }
  ]).onConflictDoNothing();

  console.log("Database seeded successfully!");
}

// Allow direct execution via tsx / node
if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding error:", err);
      process.exit(1);
    });
}


seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
