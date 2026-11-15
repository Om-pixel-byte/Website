import { db } from './index.ts';
import { products, productImages, inventory, users, companies } from './schema.ts';
import { PRODUCTS_CATALOG } from './products-data.ts';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // 1. Seed Products and Inventory
    for (const prod of PRODUCTS_CATALOG) {
      const existing = await db.select().from(products).where(eq(products.slug, prod.slug)).limit(1);
      
      let productId: number;
      if (existing.length === 0) {
        const [inserted] = await db.insert(products).values({
          name: prod.name,
          slug: prod.slug,
          category: prod.category,
          shortDesc: prod.shortDesc,
          detailedDesc: prod.detailedDesc,
          benefits: prod.benefits,
          applications: prod.applications,
          howItWorks: prod.howItWorks,
          physicalForm: prod.physicalForm,
          packaging: prod.packaging,
          technicalSpecs: prod.technicalSpecs,
          storageHandling: prod.storageHandling,
          isAvailable: true,
          stockKg: prod.stockKg,
        }).returning({ id: products.id });
        productId = inserted.id;

        // Insert primary product image
        await db.insert(productImages).values({
          productId,
          imageUrl: prod.imageUrl,
          altText: prod.name,
          isPrimary: true,
          displayOrder: 0,
        });

        // Insert inventory record
        await db.insert(inventory).values({
          productId,
          quantityOnHandKg: prod.stockKg,
          reservedKg: 0,
        }).onConflictDoNothing();
      }
    }

    // 2. Ensure Admin User Record Exists (without creating a buyer company row)
    const adminEmail = (process.env.ADMIN_EMAIL || 'omsinghwork818@gmail.com').toLowerCase();
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        uid: 'admin_owner_omrajput',
        email: adminEmail,
        name: 'Om Rajput (Owner & Administrator)',
        phone: '+91 7202007309',
        role: 'admin',
        status: 'approved',
      });
    }

    // Ensure no admin user has an entry in buyer companies table (and remove legacy seed company 26AAAAO0000A1Z5)
    const adminUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'));
    for (const admin of adminUsers) {
      await db.delete(companies).where(eq(companies.userId, admin.id));
    }
    await db.delete(companies).where(eq(companies.gstin, '26AAAAO0000A1Z5'));

    console.log('✅ Database seeded successfully with verified products and admin configuration.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
