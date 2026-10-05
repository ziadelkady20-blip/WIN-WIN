import { db } from "@/db";
import { homepageSections, categories, products } from "@/db/schema";
import { asc, eq, and } from "drizzle-orm";
import { HomeSections } from "@/components/home/HomeSections";

export const revalidate = 0;

const pepperImage = "https://images.pexels.com/photos/5701945/pexels-photo-5701945.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900";
const vegetableImage = "https://images.pexels.com/photos/9705821/pexels-photo-9705821.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900";
const fruitImage = "https://images.pexels.com/photos/5864769/pexels-photo-5864769.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900";

const fallbackSections = [
  { id:1, sectionType:"hero", titleNl:"Verse groenten en fruit, elke dag de beste kwaliteit", titleEn:"Fresh fruits and vegetables, the best quality every day", subtitleNl:"Zorgvuldig geselecteerd en gekoeld bezorgd.", subtitleEn:"Carefully selected and delivered chilled.", imageUrl:"https://images.pexels.com/photos/12932209/pexels-photo-12932209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600", buttonTextNl:"Bekijk producten", buttonTextEn:"Shop Products", buttonLink:"/shop", sortOrder:1 },
  { id:2, sectionType:"features", titleNl:"Waarom kiezen voor WIN & WIN FRESH BV", titleEn:"Why Choose WIN & WIN FRESH BV", subtitleNl:"Pure versheid en betrouwbare levering.", subtitleEn:"Freshness and reliable delivery.", config:{items:[{titleNl:"Verse Kwaliteit",titleEn:"Fresh Quality",descNl:"Dagelijks verse producten.",descEn:"Fresh products every day."},{titleNl:"Zorgvuldig Geselecteerd",titleEn:"Carefully Selected",descNl:"Een duidelijk en gecontroleerd assortiment.",descEn:"A focused, carefully selected range."},{titleNl:"Duidelijk Assortiment",titleEn:"Focused Assortment",descNl:"Alleen de producten van onze actuele lijst.",descEn:"Only products from our current list."},{titleNl:"Gekoelde Bezorging",titleEn:"Cold-Chain Delivery",descNl:"Vers verpakt en gekoeld geleverd.",descEn:"Freshly packed and delivered chilled."}]}, sortOrder:2 },
  { id:3, sectionType:"categories", titleNl:"Ontdek Onze Categorieën", titleEn:"Explore Our Categories", subtitleNl:"Peppers, groenten en fruit.", subtitleEn:"Peppers, vegetables and fruit.", buttonTextNl:"Alle categorieën", buttonTextEn:"All Categories", buttonLink:"/categories", sortOrder:3 },
  { id:4, sectionType:"featured_products", titleNl:"Uitgelichte Producten", titleEn:"Featured Products", subtitleNl:"Een selectie uit onze actuele prijslijst.", subtitleEn:"A selection from our current price list.", buttonTextNl:"Bekijk alle producten", buttonTextEn:"View All Products", buttonLink:"/shop", sortOrder:4 },
  { id:5, sectionType:"delivery", titleNl:"Vers tot aan uw deur", titleEn:"Freshness Delivered to Your Door", subtitleNl:"Gratis bezorging vanaf €35 • Gekoelde levering", subtitleEn:"Free delivery from €35 • Chilled delivery", contentNl:"Bestel eenvoudig als gast en ontvang uw bestelling gekoeld aan huis.", contentEn:"Order easily as a guest and receive your order chilled at your doorstep.", buttonTextNl:"Bestel nu", buttonTextEn:"Order Now", buttonLink:"/shop", sortOrder:5 },
];

const fallbackCategories = [
  { id:1, slug:"peppers", nameNl:"Peppers", nameEn:"Peppers", image:pepperImage, isActive:true, sortOrder:1 },
  { id:2, slug:"vegetables", nameNl:"Groenten", nameEn:"Vegetables", image:vegetableImage, isActive:true, sortOrder:2 },
  { id:3, slug:"fruit", nameNl:"Fruit", nameEn:"Fruit", image:fruitImage, isActive:true, sortOrder:3 },
];

const rawFallbackProducts = [
  ["Sivri","Sivri Pepper","peppers",1.19,pepperImage],["Çarli","Çarli Pepper","peppers",1.19,pepperImage],["Dolma","Dolma Pepper","peppers",1.19,pepperImage],["Kapia","Kapia Pepper","peppers",1.39,pepperImage],["Kıl Sivri biber","Kıl Sivri Pepper","peppers",1.69,pepperImage],["Kılçık biber","Kılçık Pepper","peppers",1.89,pepperImage],["Üçburun biber","Üçburun Pepper","peppers",1.59,pepperImage],["Kırmızı Şili biber","Red Chili Pepper","peppers",1.39,pepperImage],["Yeşil Şili biber","Green Chili Pepper","peppers",1.19,pepperImage],["Acı Cin(150g)","Acı Cin Chili (150g)","peppers",0.99,pepperImage],["Macar","Macar Pepper","peppers",1.49,pepperImage],["Patlıcan","Eggplant","vegetables",1.69,vegetableImage],["Kabak(D)","Zucchini (D)","vegetables",2.19,vegetableImage],["Mini Kabak(D)","Mini Zucchini (D)","vegetables",2.99,vegetableImage],["Acur","Acur","vegetables",2.79,vegetableImage],["Kelek","Kelek Melon","fruit",2.99,fruitImage],["Ayşekadin fasulye","Ayşekadın Green Beans","vegetables",2.09,vegetableImage],["Turplar mix","Mixed Radish","vegetables",2.09,vegetableImage],["Balkabağı(BOX-kg)","Pumpkin (BOX-kg)","vegetables",1.29,vegetableImage],["Lahana","Cabbage","vegetables",1.65,vegetableImage],["Kırkağaç","Kırkağaç Melon","fruit",1.39,fruitImage],["Nektarin","Nectarine","fruit",1.89,fruitImage],["Ejder(2 li)","Dragon Fruit (2 pcs)","fruit",2.15,fruitImage],["Ayva","Quince","fruit",2.49,fruitImage],["St maria","St. Maria Pear","fruit",2.69,fruitImage],["Deveci armut","Deveci Pear","fruit",2.59,fruitImage],["Nar (Maat 9/12)","Pomegranate (Size 9/12)","fruit",2.39,fruitImage],
] as const;

const fallbackProducts = rawFallbackProducts.map(([nameNl,nameEn,category,price,image],index)=>({
  id:index+1,
  slug:nameNl.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),
  nameNl,nameEn,pricePerKg:price.toFixed(2),salePricePerKg:null,unit:"piece",mainImage:image,origin:"",badges:[],stockStatus:"in_stock",isFeatured:index<8,isSeasonal:false,isPublished:true,sortOrder:index+1
}));

export default async function HomePage(){
  let activeSections:any[]=[]; let activeCategories:any[]=[]; let featuredProds:any[]=[]; let seasonalProds:any[]=[]; let saleProds:any[]=[];
  try{
    activeSections=await db.select().from(homepageSections).where(eq(homepageSections.isActive,true)).orderBy(asc(homepageSections.sortOrder),asc(homepageSections.id));
    activeCategories=await db.select().from(categories).where(eq(categories.isActive,true)).orderBy(asc(categories.sortOrder),asc(categories.id));
    featuredProds=await db.select().from(products).where(and(eq(products.isPublished,true),eq(products.isFeatured,true))).orderBy(asc(products.sortOrder)).limit(8);
    seasonalProds=await db.select().from(products).where(and(eq(products.isPublished,true),eq(products.isSeasonal,true))).orderBy(asc(products.sortOrder)).limit(8);
    const allPublished=await db.select().from(products).where(eq(products.isPublished,true)).orderBy(asc(products.sortOrder));
    saleProds=allPublished.filter(p=>p.salePricePerKg!==null);
  }catch(error){ console.error("Homepage database read failed; using exact catalog fallback.",error); }
  return <div className="min-h-screen bg-[#fcfbf7]"><HomeSections sections={activeSections.length?activeSections:fallbackSections} categories={activeCategories.length?activeCategories:fallbackCategories} featuredProducts={featuredProds.length?featuredProds:fallbackProducts.filter(p=>p.isFeatured)} seasonalProducts={seasonalProds.length?seasonalProds:fallbackProducts.filter(p=>p.isSeasonal)} saleProducts={saleProds.length?saleProds:fallbackProducts.filter(p=>p.salePricePerKg)}/></div>;
}
