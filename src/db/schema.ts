import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. users
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    uid: text('uid').notNull().unique(), // Firebase Auth UID
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    phone: text('phone'),
    role: text('role').notNull().default('buyer'), // 'admin' | 'buyer'
    status: text('status').notNull().default('pending'), // 'approved' | 'pending' | 'rejected'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_users_uid').on(table.uid),
    index('idx_users_email').on(table.email),
    index('idx_users_role').on(table.role),
    index('idx_users_status').on(table.status),
  ]
);

// 2. companies
export const companies = pgTable(
  'companies',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    legalName: text('legal_name').notNull(),
    tradeName: text('trade_name'),
    gstin: text('gstin').notNull().unique(),
    pan: text('pan'),
    gstStatus: text('gst_status').notNull().default('Active'),
    registeredAddress: text('registered_address').notNull(),
    city: text('city'),
    state: text('state').notNull(),
    pincode: text('pincode').notNull(),
    contactPerson: text('contact_person').notNull(),
    mobile: text('mobile').notNull(),
    businessEmail: text('business_email').notNull(),
    approvalStatus: text('approval_status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
    approvedAt: timestamp('approved_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_companies_user_id').on(table.userId),
    index('idx_companies_gstin').on(table.gstin),
    index('idx_companies_approval_status').on(table.approvalStatus),
  ]
);

// 3. gst_verifications
export const gstVerifications = pgTable(
  'gst_verifications',
  {
    id: serial('id').primaryKey(),
    gstin: text('gstin').notNull(),
    companyId: integer('company_id').references(() => companies.id, {
      onDelete: 'set null',
    }),
    responsePayload: jsonb('response_payload'),
    status: text('status').notNull(), // 'success' | 'failed' | 'manual'
    verifiedAt: timestamp('verified_at').defaultNow(),
  },
  (table) => [index('idx_gst_verifications_gstin').on(table.gstin)]
);

// 4. products
export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    category: text('category').notNull().default('Desiccant Powder'),
    shortDesc: text('short_desc').notNull(),
    detailedDesc: text('detailed_desc').notNull(),
    benefits: jsonb('benefits').notNull(), // array of strings
    applications: jsonb('applications').notNull(), // array of strings
    howItWorks: text('how_it_works').notNull(),
    physicalForm: text('physical_form').notNull(),
    packaging: text('packaging').notNull(),
    technicalSpecs: jsonb('technical_specs').notNull(), // key-value pairs or structured
    storageHandling: text('storage_handling').notNull(),
    isAvailable: boolean('is_available').notNull().default(true),
    stockKg: integer('stock_kg').notNull().default(25000),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_products_slug').on(table.slug),
    index('idx_products_available').on(table.isAvailable),
  ]
);

// 5. product_images
export const productImages = pgTable(
  'product_images',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    imageUrl: text('image_url').notNull(),
    altText: text('alt_text').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    displayOrder: integer('display_order').notNull().default(0),
  },
  (table) => [index('idx_product_images_product_id').on(table.productId)]
);

// 6. orders
export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    orderNumber: text('order_number').notNull().unique(),
    buyerUserId: integer('buyer_user_id')
      .references(() => users.id)
      .notNull(),
    companyId: integer('company_id')
      .references(() => companies.id)
      .notNull(),
    totalQuantityKg: numeric('total_quantity_kg', { precision: 12, scale: 2 }).notNull(),
    totalQuantityTons: numeric('total_quantity_tons', { precision: 12, scale: 3 }).notNull(),
    deliveryAddressSnapshot: text('delivery_address_snapshot').notNull(),
    companyNameSnapshot: text('company_name_snapshot').notNull(),
    gstinSnapshot: text('gstin_snapshot').notNull(),
    contactPersonSnapshot: text('contact_person_snapshot').notNull(),
    contactMobileSnapshot: text('contact_mobile_snapshot').notNull(),
    specialInstructions: text('special_instructions'),
    status: text('status').notNull().default('Pending'), // 'Pending' | 'Confirmed' | 'Processing' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered' | 'Rejected'
    offlinePaymentStatus: text('offline_payment_status').notNull().default('Unpaid'), // 'Unpaid' | 'Partially Paid' | 'Paid'
    paymentNotes: text('payment_notes'),
    confirmationEmailSent: boolean('confirmation_email_sent').notNull().default(false),
    confirmedAt: timestamp('confirmed_at'),
    dispatchedAt: timestamp('dispatched_at'),
    deliveredAt: timestamp('delivered_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_orders_buyer_id').on(table.buyerUserId),
    index('idx_orders_company_id').on(table.companyId),
    index('idx_orders_status').on(table.status),
    index('idx_orders_payment_status').on(table.offlinePaymentStatus),
    index('idx_orders_order_number').on(table.orderNumber),
  ]
);

// 7. order_items
export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    productId: integer('product_id')
      .references(() => products.id)
      .notNull(),
    productNameSnapshot: text('product_name_snapshot').notNull(),
    quantityKg: numeric('quantity_kg', { precision: 12, scale: 2 }).notNull(),
    quantityTons: numeric('quantity_tons', { precision: 12, scale: 3 }).notNull(),
    unitPackaging: text('unit_packaging').notNull().default('25 KG Bag'),
    notes: text('notes'),
  },
  (table) => [
    index('idx_order_items_order_id').on(table.orderId),
    index('idx_order_items_product_id').on(table.productId),
  ]
);

// 8. order_status_history
export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    previousStatus: text('previous_status'),
    newStatus: text('new_status').notNull(),
    changedByUserId: integer('changed_by_user_id').references(() => users.id),
    changedByName: text('changed_by_name').notNull().default('System/Admin'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('idx_order_status_history_order_id').on(table.orderId)]
);

// 9. invoices
export const invoices = pgTable(
  'invoices',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileSize: integer('file_size').notNull().default(0),
    invoiceNumber: text('invoice_number'),
    uploadedByUserId: integer('uploaded_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('idx_invoices_order_id').on(table.orderId)]
);

// 10. shipping_documents (e.g. E-Way Bill)
export const shippingDocuments = pgTable(
  'shipping_documents',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    documentType: text('document_type').notNull().default('eway_bill'), // 'eway_bill' | 'delivery_challan' | 'other'
    documentNumber: text('document_number'),
    fileName: text('file_name').notNull(),
    fileUrl: text('file_url').notNull(),
    fileSize: integer('file_size').notNull().default(0),
    uploadedByUserId: integer('uploaded_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('idx_shipping_documents_order_id').on(table.orderId)]
);

// 11. conversations
export const conversations = pgTable(
  'conversations',
  {
    id: serial('id').primaryKey(),
    buyerUserId: integer('buyer_user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    lastMessageAt: timestamp('last_message_at').defaultNow(),
    unreadAdminCount: integer('unread_admin_count').notNull().default(0),
    unreadBuyerCount: integer('unread_buyer_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('idx_conversations_buyer_user_id').on(table.buyerUserId)]
);

// 12. messages
export const messages = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    conversationId: integer('conversation_id')
      .references(() => conversations.id, { onDelete: 'cascade' })
      .notNull(),
    senderUserId: integer('sender_user_id')
      .references(() => users.id)
      .notNull(),
    senderRole: text('sender_role').notNull(), // 'admin' | 'buyer'
    messageText: text('message_text').notNull(),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_messages_conversation_id').on(table.conversationId),
    index('idx_messages_sender_user_id').on(table.senderUserId),
  ]
);

// 13. message_reads
export const messageReads = pgTable(
  'message_reads',
  {
    id: serial('id').primaryKey(),
    messageId: integer('message_id')
      .references(() => messages.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    readAt: timestamp('read_at').defaultNow(),
  },
  (table) => [
    index('idx_message_reads_message_id').on(table.messageId),
    index('idx_message_reads_user_id').on(table.userId),
  ]
);

// 14. notifications
export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    recipientUserId: integer('recipient_user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    link: text('link'),
    isRead: boolean('is_read').notNull().default(false),
    type: text('type').notNull().default('info'), // 'registration' | 'order' | 'document' | 'message' | 'payment'
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_notifications_recipient').on(table.recipientUserId),
    index('idx_notifications_read').on(table.isRead),
  ]
);

// 15. payments (offline records)
export const payments = pgTable(
  'payments',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
    paymentDate: text('payment_date').notNull(),
    paymentMode: text('payment_mode').notNull().default('NEFT/RTGS'), // 'NEFT/RTGS' | 'Bank Transfer' | 'Cheque' | 'Cash'
    referenceNumber: text('reference_number'),
    status: text('status').notNull().default('Paid'), // 'Paid' | 'Partially Paid' | 'Unpaid'
    notes: text('notes'),
    recordedByUserId: integer('recorded_by_user_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_payments_order_id').on(table.orderId),
    index('idx_payments_status').on(table.status),
  ]
);

// 16. inventory
export const inventory = pgTable(
  'inventory',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    quantityOnHandKg: integer('quantity_on_hand_kg').notNull().default(50000),
    reservedKg: integer('reserved_kg').notNull().default(0),
    lastUpdatedAt: timestamp('last_updated_at').defaultNow(),
  },
  (table) => [index('idx_inventory_product_id').on(table.productId)]
);

// 17. audit_logs
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    details: jsonb('details'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_user_id').on(table.userId),
    index('idx_audit_logs_action').on(table.action),
  ]
);

// 18. email_logs
export const emailLogs = pgTable(
  'email_logs',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id, {
      onDelete: 'cascade',
    }),
    recipientEmail: text('recipient_email').notNull(),
    subject: text('subject').notNull(),
    documentAttachments: jsonb('document_attachments'),
    status: text('status').notNull(), // 'sent' | 'failed'
    errorMessage: text('error_message'),
    sentAt: timestamp('sent_at').defaultNow(),
  },
  (table) => [index('idx_email_logs_order_id').on(table.orderId)]
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  orders: many(orders),
  sentMessages: many(messages),
  notifications: many(notifications),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  orders: many(orders),
  gstVerifications: many(gstVerifications),
}));

export const productsRelations = relations(products, ({ many, one }) => ({
  images: many(productImages),
  orderItems: many(orderItems),
  inventory: one(inventory, {
    fields: [products.id],
    references: [inventory.productId],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerUserId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [orders.companyId],
    references: [companies.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  invoices: many(invoices),
  shippingDocuments: many(shippingDocuments),
  payments: many(payments),
  emailLogs: many(emailLogs),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  buyer: one(users, {
    fields: [conversations.buyerUserId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderUserId],
    references: [users.id],
  }),
}));
