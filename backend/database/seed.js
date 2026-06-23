require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('./config/db');

async function seed() {
  try {
    console.log('🌱 Seeding Tony Original Morocco database...\n');

    // Admin
    const hash = await bcrypt.hash('tony2026', 12);
    await db.execute(
      `INSERT IGNORE INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Tony Admin', 'admin@tonyoriginal.ma', hash, 'super_admin']
    );
    console.log('✅ Admin seeded (admin@tonyoriginal.ma / tony2026)');

    // Categories
    const cats = [
      ['T-Shirts',    't-shirts',    'Premium heavyweight cotton tees'],
      ['Hoodies',     'hoodies',     'Drop-shoulder fleece-lined hoodies'],
      ['Pants',       'pants',       'Utility and street pants'],
      ['Accessories', 'accessories', 'Caps, bags, and accessories'],
    ];
    for (const [name, slug, description] of cats)
      await db.execute('INSERT IGNORE INTO categories (name, slug, description) VALUES (?,?,?)', [name, slug, description]);
    console.log('✅ Categories seeded');

    // Products
    const [[tshirt]] = await db.execute("SELECT id FROM categories WHERE slug = 't-shirts'");
    const [[hoodie]] = await db.execute("SELECT id FROM categories WHERE slug = 'hoodies'");
    const [[pants]]  = await db.execute("SELECT id FROM categories WHERE slug = 'pants'");
    const [[acc]]    = await db.execute("SELECT id FROM categories WHERE slug = 'accessories'");

    const products = [
      [tshirt.id, 'Tony Signature Tee', 'tony-signature-tee', 'Heavyweight premium cotton. Structured silhouette. Minimal branding — maximum presence.', 550, 800, 48, 'S,M,L,XL', 1, 'active'],
      [hoodie.id, 'Tony Essential Hoodie', 'tony-essential-hoodie', 'Cut for confidence. Fleece-lined, drop-shoulder, built to outlast trends.', 550, 800, 23, 'S,M,L,XL', 1, 'active'],
      [pants.id,  'Tony Original Cargo', 'tony-original-cargo', 'Reinforced utility pockets, tapered cut, premium ripstop fabric.', 550, 800, 0, 'S,M,L,XL', 0, 'out_of_stock'],
      [acc.id,    'Tony Morocco Cap', 'tony-morocco-cap', 'Six-panel structured fit. Embroidered Tony Original logo.', 550, 800, 112, 'One Size', 1, 'active'],
    ];
    for (const p of products)
      await db.execute(
        'INSERT IGNORE INTO products (category_id,name,slug,description,price,original_price,stock,sizes,is_featured,status) VALUES (?,?,?,?,?,?,?,?,?,?)',
        p
      );
    console.log('✅ Products seeded');

    console.log('\n🎉 Seed complete! API ready at http://localhost:5000\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
