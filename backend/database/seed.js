require('dotenv').config();
const mongoose = require('mongoose');

const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Setting = require('../models/Setting');
const Testimonial = require('../models/Testimonial');
const Brand = require('../models/Brand');
const Collection = require('../models/Collection');
const FAQ = require('../models/FAQ');
const Feature = require('../models/Feature');

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    // Clear existing data (except Admin if exists)
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
      Setting.deleteMany({}),
      Testimonial.deleteMany({}),
      Brand.deleteMany({}),
      Collection.deleteMany({}),
      FAQ.deleteMany({}),
      Feature.deleteMany({}),
    ]);

    // Admin
    const existing = await Admin.findOne({ email: 'admin@tonyoriginal.ma' });
    if (!existing) {
      const admin = new Admin({
        name: 'Tony Admin',
        email: 'admin@tonyoriginal.ma',
        password: 'tony2026',
        role: 'super_admin',
      });
      await admin.save();
      console.log('✅ Admin created (admin@tonyoriginal.ma / tony2026)');
    } else {
      console.log('✅ Admin already exists');
    }

    // Brands
    const brandData = [
      { name: 'Tony Original', slug: 'tony-original', description: 'Maison de Couture Streetwear', is_active: true },
      { name: 'Atlas Threads', slug: 'atlas-threads', description: 'Handcrafted traditional details', is_active: true },
    ];
    const seededBrands = [];
    for (const b of brandData) {
      const brand = await Brand.create(b);
      seededBrands.push(brand);
    }
    console.log('✅ Brands seeded');

    // Categories
    const catData = [
      { name: 'T-Shirts',    slug: 't-shirts',    description: 'Premium heavyweight cotton tees', image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.15.57-removebg-preview.png' },
      { name: 'Hoodies',     slug: 'hoodies',     description: 'Drop-shoulder fleece-lined hoodies', image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.16.07-removebg-preview.png' },
      { name: 'Pants',       slug: 'pants',       description: 'Utility and street pants', image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_03.44.10-removebg-preview.png' },
      { name: 'Accessories', slug: 'accessories', description: 'Caps, bags, and accessories', image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_03.44.18-removebg-preview.png' },
    ];
    const seededCats = [];
    for (const c of catData) {
      const cat = await Category.create(c);
      seededCats.push(cat);
    }
    console.log('✅ Categories seeded');

    const [tshirt, hoodie, pants, acc] = seededCats;
    const [tonyBrand, atlasBrand] = seededBrands;

    // Products
    const productData = [
      {
        category: tshirt._id,
        brand: tonyBrand._id,
        name: 'Tony Signature Tee',
        slug: 'tony-signature-tee',
        description: 'Heavyweight premium cotton. Structured silhouette. Minimal branding — maximum presence.',
        price: 550,
        original_price: 800,
        discount: 30,
        stock: 48,
        sizes: 'S,M,L,XL',
        specifications: {
          'Material': '100% Heavy Cotton (260GSM)',
          'Fit': 'Oversized drop-shoulder',
          'Origin': 'Made in Casablanca, Morocco',
          'Care': 'Machine wash cold, inside out'
        },
        is_featured: true,
        is_bestseller: true,
        is_new_arrival: false,
        is_active: true,
        status: 'active',
        images: ['/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.15.57-removebg-preview.png'],
        image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.15.57-removebg-preview.png'
      },
      {
        category: hoodie._id,
        brand: tonyBrand._id,
        name: 'Tony Essential Hoodie',
        slug: 'tony-essential-hoodie',
        description: 'Cut for confidence. Fleece-lined, drop-shoulder, built to outlast trends.',
        price: 550,
        original_price: 800,
        discount: 30,
        stock: 23,
        sizes: 'S,M,L,XL',
        specifications: {
          'Material': 'Heavyweight French Terry (400GSM)',
          'Fit': 'Boxy cropped silhouette',
          'Origin': 'Made in Marrakech, Morocco',
          'Care': 'Hang dry recommended'
        },
        is_featured: true,
        is_bestseller: false,
        is_new_arrival: true,
        is_active: true,
        status: 'active',
        images: ['/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.16.07-removebg-preview.png'],
        image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.16.07-removebg-preview.png'
      },
      {
        category: pants._id,
        brand: atlasBrand._id,
        name: 'Tony Original Cargo',
        slug: 'tony-original-cargo',
        description: 'Reinforced utility pockets, tapered cut, premium ripstop fabric with traditional hem lining details.',
        price: 550,
        original_price: 800,
        discount: 30,
        stock: 0,
        sizes: 'S,M,L,XL',
        specifications: {
          'Material': 'Military-grade ripstop cotton',
          'Fit': 'Relaxed tapered',
          'Origin': 'Fez, Morocco',
          'Hardware': 'YKK zippers'
        },
        is_featured: false,
        is_bestseller: true,
        is_new_arrival: false,
        is_active: true,
        status: 'out_of_stock',
        images: ['/CAROUSEL%20IMG/Screenshot_2026-06-23_at_03.44.10-removebg-preview.png'],
        image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_03.44.10-removebg-preview.png'
      },
      {
        category: acc._id,
        brand: tonyBrand._id,
        name: 'Tony Morocco Cap',
        slug: 'tony-morocco-cap',
        description: 'Six-panel structured fit. Embroidered Tony Original logo. Brass buckle strap closure.',
        price: 550,
        original_price: 800,
        discount: 30,
        stock: 112,
        sizes: 'One Size',
        specifications: {
          'Material': '100% Brushed cotton twill',
          'Fit': 'Adjustable unstructured',
          'Details': 'Embroidered brand logo'
        },
        is_featured: true,
        is_bestseller: false,
        is_new_arrival: true,
        is_active: true,
        status: 'active',
        images: ['/CAROUSEL%20IMG/Screenshot_2026-06-23_at_03.44.18-removebg-preview.png'],
        image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_03.44.18-removebg-preview.png'
      },
    ];
    for (const p of productData) {
      await Product.create(p);
    }
    console.log('✅ Products seeded');

    // Banners
    const bannerData = [
      { title: 'Born in Morocco. Built for the Streets.', subtitle: 'Heavyweight premium cotton. Structured silhouette.', image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.15.57-removebg-preview.png', cta_text: 'View Product', cta_link: '#products', sort_order: 0, is_active: true },
      { title: 'Wear Less. Say More.',                    subtitle: 'Cut for confidence. Fleece-lined, drop-shoulder.',   image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.16.07-removebg-preview.png', cta_text: 'View Product', cta_link: '#products', sort_order: 1, is_active: true },
      { title: 'Move with Intention.',                    subtitle: 'Reinforced utility pockets, tapered cut.',           image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_03.44.10-removebg-preview.png', cta_text: 'View Product', cta_link: '#products', sort_order: 2, is_active: true },
    ];
    await Banner.insertMany(bannerData);
    console.log('✅ Banners seeded');

    // Collections
    const collectionData = [
      { name: 'Maison Capsule', slug: 'maison-capsule', description: 'Elevated Moroccan Streetwear essentials.', is_featured: true, is_active: true, image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.15.57-removebg-preview.png' },
      { name: 'Atlas Drop', slug: 'atlas-drop', description: 'Embroidered traditional elements meet modern cuts.', is_featured: true, is_active: true, image_url: '/CAROUSEL%20IMG/Screenshot_2026-06-23_at_01.16.07-removebg-preview.png' },
    ];
    await Collection.insertMany(collectionData);
    console.log('✅ Collections seeded');

    // FAQs
    const faqData = [
      { question: 'How long does shipping take?', answer: 'Shipping takes 24-48 hours across all major cities in Morocco.', sort_order: 0, is_active: true },
      { question: 'Can I customize sizing?', answer: 'Yes! Our private concierge will contact you by phone after you place an order to discuss custom fit adjustments.', sort_order: 1, is_active: true },
      { question: 'What is your return policy?', answer: 'We offer cash-on-delivery. You can inspect your items at the time of delivery. If there is a sizing issue, we exchange it free of charge.', sort_order: 2, is_active: true },
    ];
    await FAQ.insertMany(faqData);
    console.log('✅ FAQs seeded');

    // Features
    const featureData = [
      { title: 'Moroccan Artisanship', description: 'Handcrafted individually by master tailors using premium fabrics.', icon: 'Sparkles', sort_order: 0, is_active: true },
      { title: 'Concierge Sizing Check', description: 'We call you to confirm measurements before dispatching.', icon: 'Phone', sort_order: 1, is_active: true },
      { title: 'Cash on Delivery', description: 'Verify quality and sizing in hand before making payment.', icon: 'ShoppingBag', sort_order: 2, is_active: true },
    ];
    await Feature.insertMany(featureData);
    console.log('✅ Features seeded');

    // Settings
    const settingData = [
      { key: 'website_name', value: 'Tony Original Morocco' },
      { key: 'logo_url', value: '' },
      { key: 'favicon_url', value: '' },
      { key: 'seo_title', value: 'Tony Original Morocco | Premium Streetwear Maison' },
      { key: 'seo_description', value: 'Handcrafted high-end streetwear born in Morocco. Structured fits, premium heavyweight cotton, and private concierge verification.' },
      { key: 'seo_keywords', value: 'streetwear, morocco, premium cotton, fashion, casablanca' },
      { key: 'contact_email',  value: 'contact@tonyoriginal.ma' },
      { key: 'contact_phone',  value: '+212 600 000 000' },
      { key: 'about_text',     value: 'Tony Original Morocco is a premium streetwear brand born from the streets of Morocco.' },
      { key: 'footer_text',    value: '© 2026 Tony Original Morocco. All rights reserved.' },
      { 
        key: 'hero_section', 
        value: {
          title: "Born in Morocco. Built for the Streets.",
          subtitle: "Heavyweight premium cotton. Structured silhouette. Private concierge fit verification.",
          button_text: "Shop Collection",
          button_link: "#products",
          bg_image_url: "",
          video_url: "",
          animation_option: "fade-in"
        }
      },
      {
        key: 'footer_section',
        value: {
          social_facebook: "https://facebook.com/tonyoriginal",
          social_instagram: "https://instagram.com/tonyoriginal",
          social_twitter: "https://twitter.com/tonyoriginal",
          contact_email: "contact@tonyoriginal.ma",
          contact_phone: "+212 600 000 000",
          contact_address: "Casablanca, Morocco",
          copyright: "© 2026 Tony Original Morocco. All rights reserved."
        }
      }
    ];
    for (const s of settingData) {
      await Setting.findOneAndUpdate({ key: s.key }, s, { upsert: true });
    }
    console.log('✅ Settings seeded');

    // Testimonials
    const testimonialData = [
      { author_name: 'Youssef Benjelloun', content: 'The heavyweight cotton tee feels incredibly premium. Definite wardrobe staple.', rating: 5, is_active: true },
      { author_name: 'Sara El Fassi', content: 'Beautiful cuts and structured silhouette. Fast delivery in Casablanca!', rating: 5, is_active: true },
      { author_name: 'Karim Naciri', content: 'Authentic Moroccan street style. Will buy from the next drop.', rating: 5, is_active: true }
    ];
    await Testimonial.insertMany(testimonialData);
    console.log('✅ Testimonials seeded');

    console.log('\n🎉 Seed complete! API ready at http://localhost:5001\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
