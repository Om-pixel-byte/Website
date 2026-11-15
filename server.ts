import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { eq, desc, and, sql, or, ne, notInArray } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  users,
  companies,
  gstVerifications,
  products,
  productImages,
  orders,
  orderItems,
  orderStatusHistory,
  invoices,
  shippingDocuments,
  conversations,
  messages,
  messageReads,
  notifications,
  payments,
  inventory,
  auditLogs,
  emailLogs,
} from './src/db/schema.ts';
import { seedDatabase } from './src/db/seed.ts';
import { verifyGSTIN } from './src/server/gst-service.ts';
import { sendOrderConfirmationEmail, getEmailConnectivityStatus, sendTestEmail, updateEmailSettings } from './src/server/email-service.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';

dotenv.config();

const app = express();

function resolveServerPort(): number {
  const portFlagIndex = process.argv.findIndex((arg) => arg === '--port' || arg.startsWith('--port='));
  if (portFlagIndex !== -1) {
    const raw = process.argv[portFlagIndex].startsWith('--port=')
      ? process.argv[portFlagIndex].split('=')[1]
      : process.argv[portFlagIndex + 1];
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  const envPort = Number(process.env.PORT);
  // In dev mode, container environments often set PORT=8080 for nginx reverse proxy; dev server must bind 3000.
  if (process.env.NODE_ENV !== 'production') {
    if (!envPort || envPort === 8080) return 3000;
  }
  return envPort || 3000;
}

const PORT = resolveServerPort();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'omsinghwork818@gmail.com').toLowerCase();
const OWNER_ADMIN_EMAILS = new Set([
  ADMIN_EMAIL,
  'omsinghwork818@gmail.com',
  'harshu9574465321@gmail.com',
]);

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto
    .createHash('sha256')
    .update(`omr-session-${process.env.SQL_PASSWORD || ''}-${process.env.DATABASE_URL || 'omr-b2b-2026'}`)
    .digest('hex');

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function createSignedSessionToken(payload: { uid: string; email: string; role: 'admin' | 'buyer' }): string {
  const data = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `omr_v1.${encoded}.${sig}`;
}

function verifySignedSessionToken(token: string): { uid: string; email: string; role: 'admin' | 'buyer' } | null {
  try {
    if (!token.startsWith('omr_v1.')) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [, encoded, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
    const sigBuf = Buffer.from(sig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!parsed?.exp || Date.now() > parsed.exp || !parsed.email) return null;
    return {
      uid: String(parsed.uid || ''),
      email: String(parsed.email).trim().toLowerCase(),
      role: parsed.role === 'admin' ? 'admin' : 'buyer',
    };
  } catch {
    return null;
  }
}

// Express middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder for invoices and e-way bills
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer storage for uploaded PDFs
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isImage = mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.jfif', '.tif', '.tiff'].includes(ext);
    const isPdf = mime === 'application/pdf' || ext === '.pdf';
    if (isImage || isPdf) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file format (${file.mimetype || ext}). Only image files (JPG, PNG, WebP) and PDF documents are allowed.`));
    }
  },
});

// Auth helper middleware
export interface AuthUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'buyer';
  status: 'pending' | 'approved' | 'rejected';
  companyId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      token?: string;
    }
  }
}

// User resolution middleware (strictly verifies signed session token or Firebase ID token)
async function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  if (!token) {
    return next();
  }
  req.token = token;

  try {
    let email = '';
    let uid = '';
    let isVerifiedSession = false;

    if (token.startsWith('omr_v1.')) {
      const sessionPayload = verifySignedSessionToken(token);
      if (sessionPayload) {
        email = sessionPayload.email;
        uid = sessionPayload.uid;
        isVerifiedSession = true;
      }
    } else {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        email = (decoded.email || '').trim().toLowerCase();
        uid = decoded.uid;
        isVerifiedSession = Boolean(email);
      } catch {
        // Invalid or legacy unverified token (e.g. demo-admin-token) is ignored
        isVerifiedSession = false;
      }
    }

    if (isVerifiedSession && email) {
      let [dbUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const isOwnerAdmin = OWNER_ADMIN_EMAILS.has(email);

      if (!dbUser && isOwnerAdmin) {
        const [createdAdmin] = await db.insert(users).values({
          uid: uid || `admin_${Date.now()}`,
          email,
          name: 'Om Rajput (Owner & Administrator)',
          phone: '+91 7202007309',
          role: 'admin',
          status: 'approved',
        }).onConflictDoUpdate({
          target: users.email,
          set: { role: 'admin', status: 'approved' },
        }).returning();
        dbUser = createdAdmin;
      }

      if (dbUser) {
        const [userCompany] = await db.select().from(companies).where(eq(companies.userId, dbUser.id)).limit(1);
        req.user = {
          id: dbUser.id,
          uid: dbUser.uid,
          email: dbUser.email,
          name: dbUser.name,
          role: isOwnerAdmin ? 'admin' : 'buyer',
          status: isOwnerAdmin ? 'approved' : (dbUser.status as any),
          companyId: userCompany?.id,
        };
      }
    }
  } catch (error) {
    console.warn('Auth token verification error:', error);
  }

  next();
}

app.use(authenticateUser);

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  next();
}

function requireApprovedBuyer(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role === 'admin') {
    return next();
  }
  if (req.user.status !== 'approved') {
    return res.status(403).json({
      error: 'Account pending administrator verification. Orders can only be placed once your GST registration is approved by OM RAJPUT TRADING COMPANY.',
    });
  }
  next();
}

/* ==========================================================================
   API ROUTES
   ========================================================================== */

// 1. Current user session & company profile
app.get('/api/auth/me', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }

  const [dbUser] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
  if (!dbUser) {
    return res.json({ authenticated: false, user: null });
  }

  const [company] = await db.select().from(companies).where(eq(companies.userId, dbUser.id)).limit(1);

  // Unread notifications count
  const unreadCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.recipientUserId, dbUser.id), eq(notifications.isRead, false)));

  res.json({
    authenticated: true,
    user: {
      id: dbUser.id,
      uid: dbUser.uid,
      email: dbUser.email,
      name: dbUser.name,
      phone: dbUser.phone,
      role: req.user.role,
      status: req.user.status,
      unreadNotifications: Number(unreadCount[0]?.count || 0),
    },
    company: company || null,
  });
});

// 1b. Email & Password Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const rawEmail = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!rawEmail || !password) {
      return res.status(400).json({ error: 'Email address and password are required.' });
    }

    if (OWNER_ADMIN_EMAILS.has(rawEmail)) {
      const configuredAdminPass = process.env.ADMIN_PASSWORD;
      if (!configuredAdminPass || password !== configuredAdminPass) {
        return res.status(401).json({
          error: 'Owner administrator sign-in requires "Sign in with Google" using your authorized owner Google account.',
        });
      }

      let [adminUser] = await db.select().from(users).where(eq(users.email, rawEmail)).limit(1);
      if (!adminUser) {
        [adminUser] = await db.insert(users).values({
          uid: `admin_${Date.now()}`,
          email: rawEmail,
          name: 'Om Rajput (Owner & Administrator)',
          phone: '+91 7202007309',
          role: 'admin',
          status: 'approved',
        }).returning();
      }

      const token = createSignedSessionToken({
        uid: adminUser.uid,
        email: adminUser.email,
        role: 'admin',
      });

      return res.json({
        token,
        user: {
          id: adminUser.id,
          uid: adminUser.uid,
          email: adminUser.email,
          name: adminUser.name,
          phone: adminUser.phone,
          role: 'admin',
          status: 'approved',
        },
        company: null,
      });
    }

    const [dbUser] = await db.select().from(users).where(eq(users.email, rawEmail)).limit(1);
    if (!dbUser) {
      return res.status(401).json({
        error: 'No registered business account found for this email. Please register with your 15-digit GSTIN first.',
      });
    }

    const [company] = await db.select().from(companies).where(eq(companies.userId, dbUser.id)).limit(1);
    const verifications = company
      ? await db.select().from(gstVerifications).where(eq(gstVerifications.companyId, company.id)).orderBy(desc(gstVerifications.id)).limit(1)
      : [];

    const payload: any = verifications[0]?.responsePayload || null;
    const storedHash = payload?.passwordHash;

    if (!storedHash || !verifyPassword(password, String(storedHash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = createSignedSessionToken({
      uid: dbUser.uid,
      email: dbUser.email,
      role: 'buyer',
    });

    res.json({
      token,
      user: {
        id: dbUser.id,
        uid: dbUser.uid,
        email: dbUser.email,
        name: dbUser.name,
        phone: dbUser.phone,
        role: 'buyer',
        status: dbUser.status,
      },
      company: company || null,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

// 2. GST Verification Endpoint
app.post('/api/gst/verify', async (req: Request, res: Response) => {
  try {
    const { gstin } = req.body;
    if (!gstin) {
      return res.status(400).json({ error: 'GSTIN is required.' });
    }

    const verificationResult = await verifyGSTIN(gstin);
    res.json(verificationResult);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'GSTIN verification failed.' });
  }
});

// 3. Buyer Registration with GST
app.post('/api/auth/register-gst', async (req: Request, res: Response) => {
  try {
    const {
      gstin,
      legalName,
      tradeName,
      registeredAddress,
      city,
      state,
      pincode,
      contactPerson,
      mobile,
      businessEmail,
      password,
      uid = `usr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    } = req.body;

    if (!gstin || !legalName || !registeredAddress || !state || !pincode || !contactPerson || !mobile || !businessEmail) {
      return res.status(400).json({ error: 'All GST and contact fields are required.' });
    }

    const normalizedEmail = businessEmail.trim().toLowerCase();
    if (OWNER_ADMIN_EMAILS.has(normalizedEmail)) {
      return res.status(400).json({ error: 'This email address is reserved for the platform owner administrator.' });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if GSTIN already registered
    const existingCompany = await db.select().from(companies).where(eq(companies.gstin, gstin.trim().toUpperCase())).limit(1);
    if (existingCompany.length > 0) {
      return res.status(400).json({ error: `Company with GSTIN ${gstin} is already registered in our system.` });
    }

    // Check if email already registered
    const existingUser = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'This business email is already registered.' });
    }

    const passwordHash = hashPassword(String(password));

    // 1. Create User (Pending approval)
    const [newUser] = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        name: contactPerson,
        phone: mobile,
        role: 'buyer',
        status: 'pending',
      })
      .returning({ id: users.id });

    // 2. Create Company
    const [newCompany] = await db
      .insert(companies)
      .values({
        userId: newUser.id,
        legalName: legalName.trim(),
        tradeName: tradeName?.trim() || legalName.trim(),
        gstin: gstin.trim().toUpperCase(),
        pan: gstin.trim().substring(2, 12),
        gstStatus: 'Active',
        registeredAddress: registeredAddress.trim(),
        city: city || 'Industrial Area',
        state: state.trim(),
        pincode: pincode.trim(),
        contactPerson: contactPerson.trim(),
        mobile: mobile.trim(),
        businessEmail: normalizedEmail,
        approvalStatus: 'pending',
      })
      .returning({ id: companies.id });

    // 3. Log GST Verification Record (storing scrypt passwordHash, never plaintext password)
    const sanitizedPayload = { ...req.body };
    delete sanitizedPayload.password;
    sanitizedPayload.passwordHash = passwordHash;

    await db.insert(gstVerifications).values({
      gstin: gstin.trim().toUpperCase(),
      companyId: newCompany.id,
      responsePayload: sanitizedPayload,
      status: 'pending_admin_approval',
    });

    // 4. Create Conversation channel for private chat with admin
    await db.insert(conversations).values({
      buyerUserId: newUser.id,
      unreadAdminCount: 1,
      unreadBuyerCount: 0,
    });

    // 5. Notify Company Admin
    const [adminUser] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    if (adminUser) {
      await db.insert(notifications).values({
        recipientUserId: adminUser.id,
        title: 'New Buyer Registration Awaiting Verification',
        message: `${legalName} (${gstin}) has submitted a business registration. Review and approve to allow order placement.`,
        link: '/admin/buyers',
        type: 'registration',
      });
    }

    // 6. Audit log
    await db.insert(auditLogs).values({
      userId: newUser.id,
      action: 'BUYER_REGISTRATION_SUBMITTED',
      entityType: 'companies',
      entityId: String(newCompany.id),
      details: { gstin, legalName, businessEmail },
    });

    res.json({
      success: true,
      message: 'Registration submitted successfully. The administrator will review your GSTIN and business credentials before approving your ordering access.',
      userId: newUser.id,
      companyId: newCompany.id,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed.' });
  }
});

// 4. Admin Buyer Approval / Rejection
app.post('/api/admin/buyers/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const companyId = parseInt(req.params.id);
    const { status, notes } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }

    const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    if (!company) {
      return res.status(404).json({ error: 'Company not found.' });
    }

    // Update company approval status
    await db.update(companies)
      .set({
        approvalStatus: status,
        approvedAt: status === 'approved' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));

    // Update user status
    await db.update(users)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, company.userId));

    // Notify buyer
    await db.insert(notifications).values({
      recipientUserId: company.userId,
      title: status === 'approved' ? 'GST Registration Approved' : 'Registration Application Update',
      message: status === 'approved'
        ? `Your business registration for ${company.legalName} has been approved by OM RAJPUT TRADING COMPANY. You can now place orders.`
        : `Your registration for ${company.legalName} was not approved: ${notes || 'Contact company owner for verification.'}`,
      link: '/dashboard',
      type: 'registration',
    });

    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin Buyers List (strictly buyer accounts, never owner admin)
app.get('/api/admin/buyers', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const list = await db
      .select({
        company: companies,
        user: users,
        orderCount: sql<number>`(SELECT count(*) FROM orders WHERE orders.company_id = companies.id)`,
        totalPurchasedKg: sql<string>`coalesce((SELECT sum(total_quantity_kg) FROM orders WHERE orders.company_id = companies.id), 0)`,
      })
      .from(companies)
      .innerJoin(users, eq(companies.userId, users.id))
      .where(ne(users.role, 'admin'))
      .orderBy(desc(companies.createdAt));

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Products Catalog
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const prods = await db.select().from(products).orderBy(products.id);
    const imgs = await db.select().from(productImages);

    const prodsWithImages = prods.map((p) => {
      const productImgs = imgs.filter((img) => img.productId === p.id);
      return {
        ...p,
        images: productImgs,
        primaryImage: productImgs.find((img) => img.isPrimary)?.imageUrl || productImgs[0]?.imageUrl || '',
      };
    });

    res.json(prodsWithImages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:slug', async (req: Request, res: Response) => {
  try {
    const [product] = await db.select().from(products).where(eq(products.slug, req.params.slug)).limit(1);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const imgs = await db.select().from(productImages).where(eq(productImages.productId, product.id));

    res.json({
      ...product,
      images: imgs,
      primaryImage: imgs.find((img) => img.isPrimary)?.imageUrl || imgs[0]?.imageUrl || '',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update product stock/availability and image
app.put('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const prodId = parseInt(req.params.id);
    const { isAvailable, stockKg, packaging, shortDesc, detailedDesc, image } = req.body;

    await db.update(products)
      .set({
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
        stockKg: stockKg !== undefined ? parseInt(stockKg) : undefined,
        packaging: packaging !== undefined ? packaging : undefined,
        shortDesc: shortDesc !== undefined ? shortDesc : undefined,
        detailedDesc: detailedDesc !== undefined ? detailedDesc : undefined,
        updatedAt: new Date(),
      })
      .where(eq(products.id, prodId));

    if (image) {
      const existingImages = await db.select().from(productImages).where(eq(productImages.productId, prodId));
      const primaryImage = existingImages.find((img) => img.isPrimary) || existingImages[0];
      if (primaryImage) {
        await db.update(productImages)
          .set({ imageUrl: image, isPrimary: true })
          .where(eq(productImages.id, primaryImage.id));
      } else {
        await db.insert(productImages).values({
          productId: prodId,
          imageUrl: image,
          altText: 'Product photo',
          isPrimary: true,
          displayOrder: 0,
        });
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin upload new product image (multipart/form-data)
app.post('/api/products/:id/upload-image', requireAdmin, (req: Request, res: Response) => {
  upload.single('productImage')(req, res, async (multerErr: any) => {
    if (multerErr) {
      console.warn('Multer image upload error:', multerErr.message);
      return res.status(400).json({ error: multerErr.message || 'Image upload failed' });
    }

    try {
      const prodId = parseInt(req.params.id);
      if (isNaN(prodId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      const existingImages = await db.select().from(productImages).where(eq(productImages.productId, prodId));
      const primaryImage = existingImages.find((img) => img.isPrimary) || existingImages[0];
      if (primaryImage) {
        await db.update(productImages)
          .set({ imageUrl, isPrimary: true })
          .where(eq(productImages.id, primaryImage.id));
      } else {
        await db.insert(productImages).values({
          productId: prodId,
          imageUrl,
          altText: 'Product photo',
          isPrimary: true,
          displayOrder: 0,
        });
      }

      return res.json({ success: true, imageUrl });
    } catch (err: any) {
      console.error('Product image DB update error:', err);
      return res.status(500).json({ error: err.message || 'Database error while saving product image' });
    }
  });
});

// Admin upload new product image (base64 Data URL alternative)
app.post('/api/products/:id/upload-image-base64', requireAdmin, async (req: Request, res: Response) => {
  try {
    const prodId = parseInt(req.params.id);
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    const existingImages = await db.select().from(productImages).where(eq(productImages.productId, prodId));
    const primaryImage = existingImages.find((img) => img.isPrimary) || existingImages[0];
    if (primaryImage) {
      await db.update(productImages)
        .set({ imageUrl: imageBase64, isPrimary: true })
        .where(eq(productImages.id, primaryImage.id));
    } else {
      await db.insert(productImages).values({
        productId: prodId,
        imageUrl: imageBase64,
        altText: 'Product photo',
        isPrimary: true,
        displayOrder: 0,
      });
    }

    return res.json({ success: true, imageUrl: imageBase64 });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Orders Management
// Create Order (Requires approved buyer)
app.post('/api/orders', requireApprovedBuyer, async (req: Request, res: Response) => {
  try {
    const buyerUserId = req.user!.id;
    const { items, specialInstructions } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one product item is required.' });
    }

    // Get buyer's verified company
    const [company] = await db.select().from(companies).where(eq(companies.userId, buyerUserId)).limit(1);
    if (!company) {
      return res.status(400).json({ error: 'Company record not found for user.' });
    }

    // Compute total quantities
    let totalKg = 0;
    const validatedItems: Array<{
      productId: number;
      productName: string;
      quantityKg: number;
      quantityTons: number;
      unitPackaging: string;
      notes?: string;
    }> = [];

    for (const item of items) {
      const qKg = parseFloat(item.quantityKg);
      if (isNaN(qKg) || qKg <= 0) {
        return res.status(400).json({ error: `Invalid quantity for item: ${qKg}` });
      }

      const [product] = await db.select().from(products).where(eq(products.id, parseInt(item.productId))).limit(1);
      if (!product) {
        return res.status(400).json({ error: `Product ID ${item.productId} not found.` });
      }

      totalKg += qKg;
      validatedItems.push({
        productId: product.id,
        productName: product.name,
        quantityKg: qKg,
        quantityTons: Number((qKg / 1000).toFixed(3)),
        unitPackaging: product.packaging || '25 KG Bag',
        notes: item.notes || '',
      });
    }

    const totalTons = Number((totalKg / 1000).toFixed(3));
    const orderNumber = `OMR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Snapshot GST-verified address
    const addressSnapshot = `${company.registeredAddress}, ${company.city}, ${company.state} - ${company.pincode}`;

    // 1. Insert Order
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      buyerUserId,
      companyId: company.id,
      totalQuantityKg: String(totalKg),
      totalQuantityTons: String(totalTons),
      deliveryAddressSnapshot: addressSnapshot,
      companyNameSnapshot: company.legalName,
      gstinSnapshot: company.gstin,
      contactPersonSnapshot: company.contactPerson,
      contactMobileSnapshot: company.mobile,
      specialInstructions: specialInstructions || '',
      status: 'Pending',
      offlinePaymentStatus: 'Unpaid',
    }).returning({ id: orders.id, orderNumber: orders.orderNumber });

    // 2. Insert Order Items
    for (const item of validatedItems) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        productNameSnapshot: item.productName,
        quantityKg: String(item.quantityKg),
        quantityTons: String(item.quantityTons),
        unitPackaging: item.unitPackaging,
        notes: item.notes,
      });
    }

    // 3. Status History
    await db.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      previousStatus: null,
      newStatus: 'Pending',
      changedByUserId: buyerUserId,
      changedByName: company.legalName,
      notes: 'Order placed by buyer using registered GST profile.',
    });

    // 4. Notify Admin
    const [adminUser] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    if (adminUser) {
      await db.insert(notifications).values({
        recipientUserId: adminUser.id,
        title: `New Order Received: #${orderNumber}`,
        message: `${company.legalName} placed an order for ${totalKg.toLocaleString()} KG (${totalTons} Tons).`,
        link: `/admin/orders/${newOrder.id}`,
        type: 'order',
      });
    }

    // 5. Notify Buyer
    await db.insert(notifications).values({
      recipientUserId: buyerUserId,
      title: `Order #${orderNumber} Submitted`,
      message: `Your order for ${totalKg.toLocaleString()} KG has been received. Our team will verify and process dispatch.`,
      link: `/dashboard/orders`,
      type: 'order',
    });

    res.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      totalKg,
      totalTons,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to place order.' });
  }
});

// List orders
app.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const isOwnerAdmin = req.user!.role === 'admin';
    const query = db
      .select({
        order: orders,
        company: companies,
      })
      .from(orders)
      .innerJoin(companies, eq(orders.companyId, companies.id))
      .orderBy(desc(orders.createdAt));

    const results = isOwnerAdmin
      ? await query
      : await query.where(eq(orders.buyerUserId, req.user!.id));

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single Order Detail with items, history, documents, payments
app.get('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Authorization check
    if (req.user!.role !== 'admin' && order.buyerUserId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied to this order.' });
    }

    const [company] = await db.select().from(companies).where(eq(companies.id, order.companyId)).limit(1);
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId)).orderBy(desc(orderStatusHistory.createdAt));
    const orderInvoices = await db.select().from(invoices).where(eq(invoices.orderId, orderId));
    const shippingDocs = await db.select().from(shippingDocuments).where(eq(shippingDocuments.orderId, orderId));
    const orderPayments = await db.select().from(payments).where(eq(payments.orderId, orderId)).orderBy(desc(payments.createdAt));
    const emailHistory = await db.select().from(emailLogs).where(eq(emailLogs.orderId, orderId));

    res.json({
      order,
      company,
      items,
      history,
      invoices: orderInvoices,
      shippingDocuments: shippingDocs,
      payments: orderPayments,
      emailHistory,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Admin only)
app.put('/api/orders/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Ready for Dispatch', 'Dispatched', 'Delivered', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const [existingOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const previousStatus = existingOrder.status;

    // Update timestamp flags
    const updatePayload: any = {
      status,
      updatedAt: new Date(),
    };
    if (status === 'Confirmed' && !existingOrder.confirmedAt) updatePayload.confirmedAt = new Date();
    if (status === 'Dispatched' && !existingOrder.dispatchedAt) updatePayload.dispatchedAt = new Date();
    if (status === 'Delivered' && !existingOrder.deliveredAt) updatePayload.deliveredAt = new Date();

    await db.update(orders).set(updatePayload).where(eq(orders.id, orderId));

    // Record status history
    await db.insert(orderStatusHistory).values({
      orderId,
      previousStatus,
      newStatus: status,
      changedByUserId: req.user!.id,
      changedByName: 'Om Rajput (Admin)',
      notes: notes || `Status transitioned to ${status}`,
    });

    // Notify buyer on dashboard
    await db.insert(notifications).values({
      recipientUserId: existingOrder.buyerUserId,
      title: `Order #${existingOrder.orderNumber} Status: ${status}`,
      message: `Your order status has been updated to "${status}".`,
      link: `/dashboard/orders/${orderId}`,
      type: 'order',
    });

    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Sales Invoice or E-Way Bill PDF (Admin only)
app.post('/api/orders/:id/upload-document', requireAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const documentType = req.body.documentType || 'invoice'; // 'invoice' | 'eway_bill'
    const documentNumber = req.body.documentNumber || '';

    if (!req.file) {
      return res.status(400).json({ error: 'PDF or image file is required.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    if (documentType === 'invoice') {
      const [newInvoice] = await db.insert(invoices).values({
        orderId,
        fileName,
        fileUrl,
        fileSize,
        invoiceNumber: documentNumber || `INV-${orderId}-${Date.now().toString().slice(-4)}`,
        uploadedByUserId: req.user!.id,
      }).returning();

      return res.json({ success: true, documentType: 'invoice', document: newInvoice });
    } else {
      const [newDoc] = await db.insert(shippingDocuments).values({
        orderId,
        documentType: 'eway_bill',
        documentNumber: documentNumber || '',
        fileName,
        fileUrl,
        fileSize,
        uploadedByUserId: req.user!.id,
      }).returning();

      return res.json({ success: true, documentType: 'eway_bill', document: newDoc });
    }
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

// Send Order Confirmation Email (Admin only - can be dispatched or resent whenever required)
app.post('/api/orders/:id/send-confirmation-email', requireAdmin, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const [company] = await db.select().from(companies).where(eq(companies.id, order.companyId)).limit(1);
    if (!company) {
      return res.status(404).json({ error: 'Company record missing.' });
    }

    const targetEmail = String(req.body?.recipientEmail || company.businessEmail || '').trim();
    if (!targetEmail) {
      return res.status(400).json({ error: 'Buyer recipient email address is required.' });
    }

    const [invoiceFile] = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).orderBy(desc(invoices.id)).limit(1);
    const [ewayBillFile] = await db.select().from(shippingDocuments).where(eq(shippingDocuments.orderId, orderId)).orderBy(desc(shippingDocuments.id)).limit(1);

    const result = await sendOrderConfirmationEmail({
      orderId,
      recipientEmail: targetEmail,
      orderNumber: order.orderNumber,
      companyName: company.legalName,
      totalKg: String(order.totalQuantityKg),
      totalTons: String(order.totalQuantityTons),
      invoiceFile: invoiceFile ? { fileName: invoiceFile.fileName, fileUrl: invoiceFile.fileUrl, size: invoiceFile.fileSize } : null,
      ewayBillFile: ewayBillFile ? { fileName: ewayBillFile.fileName, fileUrl: ewayBillFile.fileUrl, size: ewayBillFile.fileSize } : null,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (err: any) {
    console.error('Send confirmation email error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Email Connectivity Status Diagnostic
app.get('/api/admin/email-status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = await getEmailConnectivityStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send Test Email from Owner Admin
app.post('/api/admin/send-test-email', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { targetEmail } = req.body;
    if (!targetEmail) {
      return res.status(400).json({ error: 'Recipient target email is required.' });
    }
    const result = await sendTestEmail(targetEmail);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Email Settings (Admin only)
app.post('/api/admin/email-settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { host, port, user, pass } = req.body;
    const result = await updateEmailSettings({
      host,
      port: port ? Number(port) : undefined,
      user,
      pass,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Record Offline Payment (Admin only)
app.post('/api/orders/:id/payments', requireAdmin, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { amount, paymentDate, paymentMode, referenceNumber, status, notes } = req.body;

    if (!amount || !paymentDate) {
      return res.status(400).json({ error: 'Amount and payment date are required.' });
    }

    const [paymentRecord] = await db.insert(payments).values({
      orderId,
      amount: String(amount),
      paymentDate: String(paymentDate),
      paymentMode: paymentMode || 'NEFT/RTGS',
      referenceNumber: referenceNumber || '',
      status: status || 'Paid',
      notes: notes || '',
      recordedByUserId: req.user!.id,
    }).returning();

    // Update order payment status
    await db.update(orders)
      .set({
        offlinePaymentStatus: status || 'Paid',
        paymentNotes: notes || `Recorded payment of ₹${amount} via ${paymentMode || 'NEFT/RTGS'}`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    res.json({ success: true, payment: paymentRecord });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Private 1-on-1 Buyer <-> Admin Messaging
// Get or create conversation for buyer
app.get('/api/conversations/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const buyerUserId = req.user!.id;
    let [convo] = await db.select().from(conversations).where(eq(conversations.buyerUserId, buyerUserId)).limit(1);

    if (!convo) {
      const [newConvo] = await db.insert(conversations).values({
        buyerUserId,
      }).returning();
      convo = newConvo;
    }

    const msgs = await db.select().from(messages).where(eq(messages.conversationId, convo.id)).orderBy(messages.createdAt);

    res.json({ conversation: convo, messages: msgs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin list all buyer conversations
app.get('/api/admin/conversations', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const list = await db
      .select({
        conversation: conversations,
        buyer: users,
        company: companies,
      })
      .from(conversations)
      .innerJoin(users, eq(conversations.buyerUserId, users.id))
      .leftJoin(companies, eq(companies.userId, users.id))
      .orderBy(desc(conversations.lastMessageAt));

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages in specific conversation (Admin or conversation owner)
app.get('/api/conversations/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const convoId = parseInt(req.params.id);
    const [convo] = await db.select().from(conversations).where(eq(conversations.id, convoId)).limit(1);

    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (req.user!.role !== 'admin' && convo.buyerUserId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied to this private conversation.' });
    }

    const msgs = await db.select().from(messages).where(eq(messages.conversationId, convoId)).orderBy(messages.createdAt);
    const [buyerCompany] = await db.select().from(companies).where(eq(companies.userId, convo.buyerUserId)).limit(1);

    res.json({ conversation: convo, messages: msgs, company: buyerCompany });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send message
app.post('/api/conversations/:id/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const convoId = parseInt(req.params.id);
    const { messageText } = req.body;

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const [convo] = await db.select().from(conversations).where(eq(conversations.id, convoId)).limit(1);
    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const senderRole = req.user!.role; // 'admin' | 'buyer'
    if (senderRole !== 'admin' && convo.buyerUserId !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const [newMsg] = await db.insert(messages).values({
      conversationId: convoId,
      senderUserId: req.user!.id,
      senderRole,
      messageText: messageText.trim(),
    }).returning();

    // Update conversation timestamp & unread counters
    await db.update(conversations)
      .set({
        lastMessageAt: new Date(),
        unreadAdminCount: senderRole === 'buyer' ? sql`unread_admin_count + 1` : 0,
        unreadBuyerCount: senderRole === 'admin' ? sql`unread_buyer_count + 1` : 0,
      })
      .where(eq(conversations.id, convoId));

    res.json(newMsg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read
app.put('/api/conversations/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const convoId = parseInt(req.params.id);
    const isOwnerAdmin = req.user!.role === 'admin';

    await db.update(conversations)
      .set({
        unreadAdminCount: isOwnerAdmin ? 0 : undefined,
        unreadBuyerCount: !isOwnerAdmin ? 0 : undefined,
      })
      .where(eq(conversations.id, convoId));

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Notifications
app.get('/api/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientUserId, req.user!.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const notifId = parseInt(req.params.id);
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notifId), eq(notifications.recipientUserId, req.user!.id)));

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Admin Analytics & Excel Export
app.get('/api/admin/analytics', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const allBuyersRows = await db
      .select({ company: companies })
      .from(companies)
      .innerJoin(users, eq(companies.userId, users.id))
      .where(ne(users.role, 'admin'));
    const allBuyers = allBuyersRows.map((r) => r.company);
    const allOrders = await db.select().from(orders);

    const pendingRegistrations = allBuyers.filter((b) => b.approvalStatus === 'pending').length;
    const pendingOrders = allOrders.filter((o) => o.status === 'Pending').length;
    const confirmedOrders = allOrders.filter((o) => o.status === 'Confirmed').length;
    const processingOrders = allOrders.filter((o) => o.status === 'Processing').length;
    const dispatchedOrders = allOrders.filter((o) => o.status === 'Dispatched' || o.status === 'Ready for Dispatch').length;
    const deliveredOrders = allOrders.filter((o) => o.status === 'Delivered').length;

    let totalQuantityKg = 0;
    allOrders.forEach((o) => {
      totalQuantityKg += parseFloat(String(o.totalQuantityKg || '0'));
    });

    const paidOrders = allOrders.filter((o) => o.offlinePaymentStatus === 'Paid').length;
    const unpaidOrders = allOrders.filter((o) => o.offlinePaymentStatus === 'Unpaid').length;
    const partialPaidOrders = allOrders.filter((o) => o.offlinePaymentStatus === 'Partially Paid').length;

    res.json({
      totalBuyers: allBuyers.length,
      pendingRegistrations,
      totalOrders: allOrders.length,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      dispatchedOrders,
      deliveredOrders,
      totalQuantityKg,
      totalQuantityTons: (totalQuantityKg / 1000).toFixed(2),
      offlinePayments: {
        paid: paidOrders,
        unpaid: unpaidOrders,
        partiallyPaid: partialPaidOrders,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Export reports to Excel (.xlsx) per Section 8F
app.get('/api/admin/export-excel', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const allOrders = await db
      .select({
        orderNumber: orders.orderNumber,
        companyName: orders.companyNameSnapshot,
        gstin: orders.gstinSnapshot,
        contactPerson: orders.contactPersonSnapshot,
        mobile: orders.contactMobileSnapshot,
        totalKg: orders.totalQuantityKg,
        totalTons: orders.totalQuantityTons,
        deliveryAddress: orders.deliveryAddressSnapshot,
        status: orders.status,
        offlinePaymentStatus: orders.offlinePaymentStatus,
        paymentNotes: orders.paymentNotes,
        confirmationEmailSent: orders.confirmationEmailSent,
        orderDate: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const allCompaniesRows = await db
      .select({ company: companies })
      .from(companies)
      .innerJoin(users, eq(companies.userId, users.id))
      .where(ne(users.role, 'admin'))
      .orderBy(desc(companies.createdAt));
    const allCompanies = allCompaniesRows.map((r) => r.company);

    const workbook = XLSX.utils.book_new();

    const ordersWorksheet = XLSX.utils.json_to_sheet(allOrders);
    XLSX.utils.book_append_sheet(workbook, ordersWorksheet, 'Orders');

    const buyersWorksheet = XLSX.utils.json_to_sheet(
      allCompanies.map((c) => ({
        LegalName: c.legalName,
        TradeName: c.tradeName,
        GSTIN: c.gstin,
        PAN: c.pan,
        Status: c.approvalStatus,
        State: c.state,
        Pincode: c.pincode,
        ContactPerson: c.contactPerson,
        Mobile: c.mobile,
        Email: c.businessEmail,
        RegistrationDate: c.createdAt,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, buyersWorksheet, 'Registered Buyers');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=om_rajput_trading_orders_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (err: any) {
    console.error('Excel export error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, status: 'healthy', port: PORT });
});

// Admin Reset All Platform Data (Owner Admin only, requires explicit confirmation)
app.post('/api/admin/reset-data', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { confirmText, resetProducts = false } = req.body || {};
    if (String(confirmText || '').trim().toUpperCase() !== 'RESET') {
      return res.status(400).json({ error: 'Confirmation phrase "RESET" is required to reset platform data.' });
    }

    // 1. Delete transactional & messaging data in FK-safe order
    await db.delete(emailLogs);
    await db.delete(payments);
    await db.delete(shippingDocuments);
    await db.delete(invoices);
    await db.delete(orderStatusHistory);
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(messageReads);
    await db.delete(messages);
    await db.delete(conversations);
    await db.delete(notifications);
    await db.delete(auditLogs);
    await db.delete(gstVerifications);

    // 2. Delete ALL registered buyer companies and non-admin user accounts while preserving Owner Admin login
    await db.delete(companies);
    await db.delete(users).where(ne(users.role, 'admin'));
    await db.update(users).set({ status: 'approved' }).where(eq(users.role, 'admin'));

    // 3. Clean uploaded files (invoices/e-way bills, and optionally product images)
    if (fs.existsSync(UPLOADS_DIR)) {
      for (const file of fs.readdirSync(UPLOADS_DIR)) {
        if (resetProducts || !file.startsWith('productImage-')) {
          try {
            fs.unlinkSync(path.join(UPLOADS_DIR, file));
          } catch {
            // ignore file deletion errors
          }
        }
      }
    }

    // 4. Optionally reset product catalogue stock & images back to factory defaults
    if (resetProducts) {
      await db.delete(productImages);
      await db.delete(inventory);
      await db.delete(products);
    }

    // 5. Re-run seedDatabase to ensure Admin profile and 8 core products exist cleanly
    await seedDatabase();

    res.json({
      success: true,
      resetProducts: Boolean(resetProducts),
      message: resetProducts
        ? 'Full factory reset complete. All buyers, orders, invoices, messages, and custom product edits have been wiped and default catalogue restored.'
        : 'All buyers, orders, invoices, E-Way bills, chats, and notifications have been reset cleanly. Your 8 product listings and admin login remain intact.',
    });
  } catch (err: any) {
    console.error('Admin data reset error:', err);
    res.status(500).json({ error: err.message || 'Failed to reset database records.' });
  }
});

// Ensure all /api/* routes return JSON on 404, never falling through to Vite HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global JSON error handler for API requests
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Express API error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Seed DB asynchronously with retry in case Cloud SQL proxy finishes booting slightly after Node
async function runInitialSeed(attempt = 1): Promise<void> {
  try {
    await seedDatabase();
  } catch (err) {
    if (attempt < 3) {
      setTimeout(() => {
        runInitialSeed(attempt + 1).catch(() => {});
      }, 3000);
    } else {
      console.error('Seed execution error:', err);
    }
  }
}

// Start Vite in dev mode or serve static build
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OM RAJPUT TRADING COMPANY server active on http://0.0.0.0:${PORT}`);
    runInitialSeed().catch(() => {});
  });

  httpServer.on('error', (err: any) => {
    console.error(`Server failed to bind port ${PORT}:`, err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
