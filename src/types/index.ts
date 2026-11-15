export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  shortDesc: string;
  detailedDesc: string;
  benefits: string[];
  applications: string[];
  howItWorks: string;
  physicalForm: string;
  packaging: string;
  technicalSpecs: Record<string, string>;
  storageHandling: string;
  isAvailable: boolean;
  stockKg: number;
  primaryImage: string;
  image?: string;
  images?: Array<{ id: number; imageUrl: string; altText: string; isPrimary: boolean }>;
}

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'buyer';
  status: 'pending' | 'approved' | 'rejected';
  unreadNotifications: number;
}

export interface CompanyProfile {
  id: number;
  userId: number;
  legalName: string;
  tradeName?: string;
  gstin: string;
  pan?: string;
  gstStatus: string;
  registeredAddress: string;
  city?: string;
  state: string;
  pincode: string;
  contactPerson: string;
  mobile: string;
  businessEmail: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productNameSnapshot: string;
  quantityKg: string;
  quantityTons: string;
  unitPackaging: string;
  notes?: string;
}

export interface OrderStatusHistoryItem {
  id: number;
  orderId: number;
  previousStatus: string | null;
  newStatus: string;
  changedByName: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceDoc {
  id: number;
  orderId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  invoiceNumber?: string;
  createdAt: string;
}

export interface ShippingDoc {
  id: number;
  orderId: number;
  documentType: string;
  documentNumber?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
}

export interface PaymentRecord {
  id: number;
  orderId: number;
  amount: string;
  paymentDate: string;
  paymentMode: string;
  referenceNumber?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  buyerUserId: number;
  companyId: number;
  totalQuantityKg: string;
  totalQuantityTons: string;
  deliveryAddressSnapshot: string;
  companyNameSnapshot: string;
  gstinSnapshot: string;
  contactPersonSnapshot: string;
  contactMobileSnapshot: string;
  specialInstructions?: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered' | 'Rejected';
  offlinePaymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  paymentNotes?: string;
  confirmationEmailSent: boolean;
  confirmedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFullData {
  order: OrderDetail;
  company: CompanyProfile;
  items: OrderItem[];
  history: OrderStatusHistoryItem[];
  invoices: InvoiceDoc[];
  shippingDocuments: ShippingDoc[];
  payments: PaymentRecord[];
}

export interface MessageItem {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderRole: 'admin' | 'buyer';
  messageText: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  recipientUserId: number;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}
