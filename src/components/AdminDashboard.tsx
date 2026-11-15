import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  Mail,
  Download,
  MessageSquare,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Send,
  AlertCircle,
  Truck,
  RotateCw,
  Edit,
  Loader2,
  Image as ImageIcon,
  Building,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Product, OrderFullData, MessageItem } from '../types/index.ts';

interface AdminDashboardProps {
  onLogout: () => void;
  products: Product[];
  onRefreshProducts: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  products,
  onRefreshProducts,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'buyers' | 'orders' | 'dispatch' | 'products' | 'chat'>('analytics');

  // Analytics stats
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Buyers list
  const [buyersList, setBuyersList] = useState<any[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);

  // Orders list
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderFullData | null>(null);

  // Status update
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Document upload state
  const [uploadDocType, setUploadDocType] = useState<'invoice' | 'eway_bill'>('invoice');
  const [docNumber, setDocNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Email confirmation trigger
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | false | null>(null);
  const [confirmRecipientEmail, setConfirmRecipientEmail] = useState('');

  // Conversations list & active chat
  const [conversationsList, setConversationsList] = useState<any[]>([]);
  const [activeChatConvoId, setActiveChatConvoId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<MessageItem[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Product edit modal with image support
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStockKg, setEditStockKg] = useState<number>(0);
  const [editIsAvailable, setEditIsAvailable] = useState<boolean>(true);
  const [editPackaging, setEditPackaging] = useState('');
  const [editImage, setEditImage] = useState<string>('');
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Admin Data Reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetIncludeProducts, setResetIncludeProducts] = useState(false);
  const [resettingData, setResettingData] = useState(false);
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string } | null>(null);

  const getAuthToken = () => localStorage.getItem('omr_token') || '';

  const adminHeaders = {
    'Authorization': `Bearer ${getAuthToken()}`,
  };

  const loadAnalytics = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/analytics', { headers: adminHeaders });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadBuyers = async () => {
    setLoadingBuyers(true);
    try {
      const res = await fetch('/api/admin/buyers', { headers: adminHeaders });
      const data = await res.json();
      setBuyersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBuyers(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', { headers: adminHeaders });
      const data = await res.json();
      setOrdersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadOrderDetail = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { headers: adminHeaders });
      const data = await res.json();
      setSelectedOrder(data);
      setStatusToUpdate(data.order.status);
      setConfirmRecipientEmail(data.company?.businessEmail || '');
      setEmailStatusMessage('');
      setEmailPreviewUrl(null);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/admin/conversations', { headers: adminHeaders });
      const data = await res.json();
      setConversationsList(data);
      if (data.length > 0 && !activeChatConvoId) {
        selectChat(data[0].conversation.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectChat = async (convoId: number) => {
    setActiveChatConvoId(convoId);
    try {
      const res = await fetch(`/api/conversations/${convoId}/messages`, { headers: adminHeaders });
      const data = await res.json();
      setChatMessages(data.messages || []);
      // Mark as read
      await fetch(`/api/conversations/${convoId}/read`, { method: 'PUT', headers: adminHeaders });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadBuyers();
    loadOrders();
    loadConversations();
  }, []);

  // Handle buyer approve/reject
  const handleBuyerStatus = async (companyId: number, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/buyers/${companyId}/status`, {
        method: 'POST',
        headers: { ...adminHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadBuyers();
        loadAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !statusToUpdate) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.order.id}/status`, {
        method: 'PUT',
        headers: { ...adminHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToUpdate, notes: statusNotes }),
      });
      if (res.ok) {
        setStatusNotes('');
        loadOrderDetail(selectedOrder.order.id);
        loadOrders();
        loadAnalytics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Upload document
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedFile) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', uploadDocType);
    formData.append('documentNumber', docNumber);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.order.id}/upload-document`, {
        method: 'POST',
        headers: adminHeaders,
        body: formData,
      });
      if (res.ok) {
        setSelectedFile(null);
        setDocNumber('');
        loadOrderDetail(selectedOrder.order.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Send Order Confirmation Email (on-demand whenever admin requires)
  const handleSendConfirmationEmail = async () => {
    if (!selectedOrder) return;
    setSendingEmail(true);
    setEmailStatusMessage('');
    setEmailPreviewUrl(null);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.order.id}/send-confirmation-email`, {
        method: 'POST',
        headers: {
          ...adminHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: confirmRecipientEmail.trim() || selectedOrder.company.businessEmail,
        }),
      });
      const data = await res.json();
      setEmailStatusMessage(data.message || data.error || (data.success ? 'Email sent!' : 'Failed to send email.'));
      setEmailPreviewUrl(data.previewUrl || null);
      loadOrderDetail(selectedOrder.order.id);
      loadOrders();
    } catch (err: any) {
      setEmailStatusMessage(err.message || 'Error sending confirmation email.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Upload product image file (with instant preview and safe fallback)
  const handleUploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    // 1. Instant client-side preview via FileReader
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditImage(reader.result);
      }
    };
    reader.readAsDataURL(file);

    setUploadingProductImage(true);
    try {
      const formData = new FormData();
      formData.append('productImage', file);

      const res = await fetch(`/api/products/${editingProduct.id}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.imageUrl) {
          setEditImage(data.imageUrl);
          return;
        } else if (data.error) {
          console.warn('Image upload server response:', data.error);
        }
      }

      // If server returned non-JSON, fallback to Base64 upload
      if (typeof reader.result === 'string') {
        const b64Res = await fetch(`/api/products/${editingProduct.id}/upload-image-base64`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: reader.result }),
        });
        if (b64Res.ok) {
          const b64Data = await b64Res.json();
          if (b64Data.imageUrl) {
            setEditImage(b64Data.imageUrl);
          }
        }
      }
    } catch (err: any) {
      console.warn('Image upload network note (using local preview):', err.message);
    } finally {
      setUploadingProductImage(false);
    }
  };

  // Send chat reply
  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatConvoId || !adminReplyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/conversations/${activeChatConvoId}/messages`, {
        method: 'POST',
        headers: { ...adminHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: adminReplyText }),
      });
      const saved = await res.json();
      setChatMessages([...chatMessages, saved]);
      setAdminReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  // Save product edits including image
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSavingProduct(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { ...adminHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockKg: editStockKg,
          isAvailable: editIsAvailable,
          packaging: editPackaging,
          image: editImage,
        }),
      });
      if (res.ok) {
        setEditingProduct(null);
        onRefreshProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProduct(false);
    }
  };

  // Reset All Data (Owner Admin)
  const handleResetAllData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmText.trim().toUpperCase() !== 'RESET') return;
    setResettingData(true);
    setResetResult(null);
    try {
      const res = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmText: resetConfirmText.trim(),
          resetProducts: resetIncludeProducts,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetResult({ success: true, message: data.message });
        setShowResetModal(false);
        setResetConfirmText('');
        setSelectedOrder(null);
        setActiveChatConvoId(null);
        setChatMessages([]);
        loadAnalytics();
        loadBuyers();
        loadOrders();
        loadConversations();
        onRefreshProducts();
      } else {
        setResetResult({ success: false, message: data.error || 'Data reset failed.' });
      }
    } catch (err: any) {
      setResetResult({ success: false, message: err.message || 'Network error during reset.' });
    } finally {
      setResettingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] pb-24">
      
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#1e1b4b] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/60 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  OM RAJPUT TRADING COMPANY · Owner Admin Portal
                </h1>
              </div>
              <p className="text-xs text-purple-200">
                Single Administrator: Om Rajput (omsinghwork818@gmail.com) · Dadra, D.&N.H. Warehouse Control
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1 p-1 bg-white rounded-2xl border border-purple-100 shadow-xs mb-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Analytics & Reports
          </button>
          <button
            onClick={() => setActiveTab('buyers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'buyers'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Buyer Management</span>
            {stats?.pendingRegistrations > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                {stats.pendingRegistrations}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Order Management ({ordersList.length})</span>
            {stats?.pendingOrders > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {stats.pendingOrders}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Catalogue & Stock
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'chat'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Buyer Private Chat
          </button>
        </div>

        {/* TAB 1: ANALYTICS & REPORTS (Section 8F) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Buyers</span>
                <div className="text-2xl font-extrabold text-[#0f172a]">{stats?.totalBuyers || 0}</div>
                <div className="text-[10px] text-purple-600 font-bold">
                  {stats?.pendingRegistrations || 0} Pending Approval
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Orders</span>
                <div className="text-2xl font-extrabold text-[#0f172a]">{stats?.totalOrders || 0}</div>
                <div className="text-[10px] text-amber-600 font-bold">
                  {stats?.pendingOrders || 0} Awaiting Confirmation
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Processing / Ready</span>
                <div className="text-2xl font-extrabold text-[#4338ca]">
                  {(stats?.processingOrders || 0) + (stats?.confirmedOrders || 0)}
                </div>
                <div className="text-[10px] text-slate-500">Scheduled in Dadra</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Dispatched / Transit</span>
                <div className="text-2xl font-extrabold text-blue-600">{stats?.dispatchedOrders || 0}</div>
                <div className="text-[10px] text-slate-500">With Bilty & E-Way Bill</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Delivered Orders</span>
                <div className="text-2xl font-extrabold text-emerald-600">{stats?.deliveredOrders || 0}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Completed Deliveries</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Supplied Weight</span>
                <div className="text-xl font-extrabold text-[#1e1b4b]">
                  {stats?.totalQuantityTons || '0.00'}{' '}
                  <span className="text-xs font-normal text-slate-500">Tons</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {(stats?.totalQuantityKg || 0).toLocaleString()} KG
                </div>
              </div>
            </div>

            {/* Platform Data Reset & Factory Restore Card */}
            <div className="p-6 rounded-3xl bg-white border border-rose-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-[#0f172a] flex items-center space-x-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Platform Data Reset (Danger Zone)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clear all test or old buyers, orders, uploaded invoices/E-Way bills, chats, and notifications while keeping your owner admin access safe.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setResetConfirmText('');
                    setResetIncludeProducts(false);
                    setShowResetModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shrink-0 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All Data</span>
                </button>
              </div>

              {resetResult && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                  resetResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {resetResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{resetResult.message}</span>
                </div>
              )}
            </div>

            {/* Confirmation Modal for Data Reset */}
            {showResetModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                <form onSubmit={handleResetAllData} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-100">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0f172a]">Confirm Complete Data Reset</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        This permanently deletes all registered buyers, orders, status logs, uploaded invoices, E-Way bills, chats, and notifications from the database.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start space-x-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={resetIncludeProducts}
                      onChange={(e) => setResetIncludeProducts(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Also reset Product Stock & Images to defaults</span>
                      <span className="text-[11px] text-slate-500">Leave unchecked to preserve any custom product images, packaging labels, and stock quantities.</span>
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Type <span className="font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">RESET</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={resetConfirmText}
                      onChange={(e) => setResetConfirmText(e.target.value)}
                      placeholder="Type RESET"
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-rose-500"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(false)}
                      disabled={resettingData}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resettingData || resetConfirmText.trim().toUpperCase() !== 'RESET'}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center space-x-1.5"
                    >
                      {resettingData && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{resettingData ? 'Resetting...' : 'Reset Everything'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: BUYER MANAGEMENT (Section 8A) */}
        {activeTab === 'buyers' && (
          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#0f172a]">Registered Buyer Companies</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify 15-digit GSTIN and approve ordering permissions.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Company & GSTIN</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">State / Address</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Contact Person</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {buyersList.map((item) => (
                    <tr key={item.company.id} className="hover:bg-purple-50/20">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{item.company.legalName}</div>
                        <div className="font-mono text-xs text-[#1e1b4b]">{item.company.gstin}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                        {item.company.registeredAddress}, {item.company.city}, {item.company.state}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{item.company.contactPerson}</div>
                        <div className="text-[11px] text-slate-500">{item.company.mobile}</div>
                        <div className="text-[11px] text-slate-400">{item.company.businessEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.company.approvalStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.company.approvalStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.company.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        {item.company.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => handleBuyerStatus(item.company.id, 'approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}
                        {item.company.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => handleBuyerStatus(item.company.id, 'rejected')}
                            className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-bold text-[11px] hover:bg-red-200"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER MANAGEMENT & DISPATCH (Sections 8C, 8D, 10) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Detailed Order Action Panel if selected */}
            {selectedOrder && (
              <div className="p-6 bg-white rounded-3xl border border-purple-200 shadow-md space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500">Managing Order</span>
                    <h3 className="text-xl font-extrabold text-[#0f172a] font-mono">
                      #{selectedOrder.order.orderNumber}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Close Order View &times;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-500 font-semibold">Buyer Company & GSTIN:</span>
                    <div className="font-bold text-slate-900">{selectedOrder.company.legalName}</div>
                    <div className="font-mono text-purple-900">{selectedOrder.company.gstin}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-slate-500 font-semibold">Delivery Address Snapshot:</span>
                    <p className="font-medium text-slate-800 leading-relaxed">
                      {selectedOrder.order.deliveryAddressSnapshot}
                    </p>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ordered Materials & Tonnage:
                  </span>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {selectedOrder.items.map((it) => (
                      <div key={it.id} className="p-3 bg-white flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{it.productNameSnapshot}</div>
                          <div className="text-[11px] text-slate-500">{it.unitPackaging}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 text-sm">{Number(it.quantityKg).toLocaleString()} KG</span>
                          <span className="block text-[11px] text-[#db2777] font-semibold">{it.quantityTons} Tons</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Transition Control (Section 9) */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1e1b4b]">
                    Update Order Status (Logged into order_status_history)
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      'Pending',
                      'Confirmed',
                      'Processing',
                      'Ready for Dispatch',
                      'Dispatched',
                      'Delivered',
                      'Rejected',
                    ].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusToUpdate(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          statusToUpdate === st
                            ? 'bg-[#1e1b4b] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Optional notes for status update (e.g. Scheduled for Dadra tempo dispatch)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none bg-white"
                    />
                    <button
                      onClick={handleUpdateOrderStatus}
                      disabled={updatingStatus}
                      className="px-4 py-2 rounded-xl bg-[#4338ca] hover:bg-[#312e81] text-white text-xs font-bold transition-colors shrink-0"
                    >
                      {updatingStatus ? 'Updating...' : 'Save Status'}
                    </button>
                  </div>
                </div>

                {/* Document Upload (Existing Sales Tax Invoice & E-Way Bill) - Section 10 */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                      <Upload className="w-4 h-4 text-purple-600" />
                      <span>Upload Existing Invoice PDF / E-Way Bill PDF</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload your already-created tax documents. No invoice generation is performed.
                    </p>
                  </div>

                  <form onSubmit={handleUploadDocument} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Document Type</label>
                        <select
                          value={uploadDocType}
                          onChange={(e: any) => setUploadDocType(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                        >
                          <option value="invoice">Sales Tax Invoice PDF</option>
                          <option value="eway_bill">E-Way Bill PDF</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Document Number</label>
                        <input
                          type="text"
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          placeholder="e.g. INV-2026-0042 / EWB-987654"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-700 font-bold mb-1.5 text-xs">
                          Select Document File (PDF / Image) *
                        </label>
                        <input
                          type="file"
                          required
                          accept=".pdf,image/*"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1e1b4b] file:text-white hover:file:bg-[#312e81] file:cursor-pointer file:transition-all cursor-pointer bg-purple-50/40 border border-purple-200/80 rounded-2xl p-2 hover:border-purple-300 focus:outline-none transition-all shadow-xs"
                        />
                        {selectedFile && (
                          <div className="mt-1.5 flex items-center space-x-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingDoc || !selectedFile}
                      className="px-4 py-2 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] disabled:bg-slate-300 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      {uploadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-pink-400" />}
                      <span>Upload Document to Order</span>
                    </button>
                  </form>

                  {/* List of uploaded documents */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {selectedOrder.invoices.map((inv) => (
                      <div key={inv.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-slate-800 truncate">{inv.fileName}</span>
                        </div>
                        <a href={inv.fileUrl} target="_blank" rel="noreferrer" className="text-purple-600 font-bold hover:underline">
                          View
                        </a>
                      </div>
                    ))}
                    {selectedOrder.shippingDocuments.map((doc) => (
                      <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-pink-600" />
                          <span className="font-bold text-slate-800 truncate">{doc.fileName}</span>
                        </div>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-pink-600 font-bold hover:underline">
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Send Confirmation Email to Buyer (on-demand whenever admin requires) */}
                <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-pink-950 flex items-center space-x-1.5">
                        <Mail className="w-4 h-4 text-[#db2777]" />
                        <span>Send Order Confirmation Email to Buyer</span>
                        {selectedOrder.order.confirmationEmailSent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Sent
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-pink-800 mt-0.5">
                        Sends confirmation details and attached Invoice / E-Way Bill PDFs to the buyer whenever required.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="email"
                      value={confirmRecipientEmail}
                      onChange={(e) => setConfirmRecipientEmail(e.target.value)}
                      placeholder="Buyer email address"
                      className="flex-1 bg-white border border-pink-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#db2777]"
                    />
                    <button
                      type="button"
                      onClick={handleSendConfirmationEmail}
                      disabled={sendingEmail}
                      className="px-4 py-2 rounded-xl bg-[#db2777] hover:bg-[#be185d] disabled:bg-slate-300 text-white font-bold text-xs transition-colors shrink-0 flex items-center justify-center space-x-1.5"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Email...</span>
                        </>
                      ) : selectedOrder.order.confirmationEmailSent ? (
                        <span>Resend Order Confirmation Email</span>
                      ) : (
                        <span>Send Order Confirmation Email</span>
                      )}
                    </button>
                  </div>

                  {emailStatusMessage && (
                    <div className="text-[11px] font-semibold text-slate-700 bg-white/90 p-2.5 rounded-xl border border-pink-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span>{emailStatusMessage}</span>
                      {emailPreviewUrl && (
                        <a
                          href={emailPreviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-[#1e1b4b] text-white text-[11px] font-bold hover:bg-[#312e81] shrink-0 text-center"
                        >
                          View Email Preview ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-lg font-extrabold text-[#0f172a]">All Customer Orders</h2>
                <span className="text-xs text-slate-500">{ordersList.length} total orders recorded</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Order #</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Buyer Company</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Total Weight</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Status</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Documents</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {ordersList.map((item) => (
                      <tr key={item.order.id} className="hover:bg-purple-50/20">
                        <td className="px-4 py-3 font-mono font-bold text-[#1e1b4b]">
                          {item.order.orderNumber}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.company.legalName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.company.gstin}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {Number(item.order.totalQuantityKg).toLocaleString()} KG ({item.order.totalQuantityTons} Tons)
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            item.order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.order.status === 'Dispatched'
                              ? 'bg-blue-100 text-blue-800'
                              : item.order.status === 'Confirmed'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px]">
                          {item.order.confirmationEmailSent ? (
                            <span className="text-emerald-700 font-semibold">Sent to Buyer</span>
                          ) : (
                            <span className="text-slate-400">Pending send</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => loadOrderDetail(item.order.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#1e1b4b] text-white font-bold text-xs hover:bg-[#312e81]"
                          >
                            Manage Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PRODUCT MANAGEMENT (Section 8B) */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-[#0f172a]">Product Inventory & Availability</h2>
                <p className="text-xs text-slate-500">
                  Update stock levels and packaging information across all 8 verified catalogue items.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex space-x-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                    <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.packaging}</div>
                      <div className="text-xs text-slate-700 font-semibold mt-1">
                        Stock: {p.stockKg.toLocaleString()} KG
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {p.isAvailable ? 'Active in Catalogue' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setEditStockKg(p.stockKg);
                          setEditIsAvailable(p.isAvailable);
                          setEditPackaging(p.packaging);
                          setEditImage(p.primaryImage || p.image || '');
                        }}
                        className="px-3 py-1 rounded-lg bg-[#1e1b4b] text-white font-bold text-xs flex items-center space-x-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Edit Modal */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-sm text-[#0f172a] flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>Edit {editingProduct.name}</span>
                    </h3>
                    <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</button>
                  </div>

                  <div className="space-y-4 text-xs">
                    
                    {/* Feature to edit image (User request: In catalogue and stock add one more feature to edit image also in admin dashboard) */}
                    <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2.5">
                      <label className="block font-bold text-slate-800">Product Photograph / Image</label>
                      <div className="flex items-center space-x-3">
                        <img
                          src={editImage || editingProduct.primaryImage || editingProduct.image || ''}
                          alt={editingProduct.name}
                          className="w-16 h-16 object-cover rounded-xl border-2 border-purple-200 shadow-2xs shrink-0 bg-white"
                        />
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] text-slate-500 font-medium block">Image URL / Path</label>
                          <input
                            type="text"
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            placeholder="e.g. /assets/aistudio/... or https://..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* Styled file input for image upload */}
                      <div className="pt-1">
                        <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                          Upload New Image File (JPG / PNG)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProductImage}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-[#1e1b4b] file:text-white hover:file:bg-[#312e81] file:cursor-pointer cursor-pointer bg-white border border-slate-200 rounded-xl p-1.5 focus:outline-none transition-all shadow-2xs"
                        />
                        {uploadingProductImage && (
                          <div className="text-[11px] text-purple-700 flex items-center space-x-1 mt-1 font-semibold">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading image to server...</span>
                          </div>
                        )}
                      </div>

                      {/* Quick select from authentic Dadra warehouse stock photos */}
                      <div className="pt-1">
                        <label className="text-[11px] text-slate-500 font-medium block mb-1">
                          Or select authentic warehouse bag photograph:
                        </label>
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {[
                            { name: 'Shine Addi Bag', path: '/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.47_PM_7b8b9067.jpeg' },
                            { name: 'Supreme Bag', path: '/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.46_PM__2__54016b74.jpeg' },
                            { name: 'Redbull Bag', path: '/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.46_PM__1__5c8e60fa.jpeg' },
                            { name: 'Gold Magic Bag', path: '/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.48_PM_fc2dcb72.jpeg' },
                            { name: 'Granules Bag', path: '/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.47_PM__1__0c863718.jpeg' },
                            { name: 'Royal Desiccant Powder', path: '/assets/aistudio/royal_desiccant_powder.png' },
                            { name: 'Masterbatch Pellets', path: '/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.48_PM__1__eaa78edf.jpeg' },
                            { name: 'Warehouse Stack', path: '/assets/aistudio/WhatsApp_Image_2026-11-08_at_2.08.46_PM_776980b2.jpeg' },
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setEditImage(item.path)}
                              title={item.name}
                              className={`shrink-0 rounded-lg p-0.5 border-2 transition-all ${
                                editImage === item.path ? 'border-purple-600 ring-2 ring-purple-300' : 'border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              <img src={item.path} alt={item.name} className="w-10 h-10 object-cover rounded-md" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Stock in Warehouse (KG)</label>
                      <input
                        type="number"
                        value={editStockKg}
                        onChange={(e) => setEditStockKg(parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-300 rounded-xl p-2 outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Packaging Label</label>
                      <input
                        type="text"
                        value={editPackaging}
                        onChange={(e) => setEditPackaging(e.target.value)}
                        className="w-full border border-slate-300 rounded-xl p-2 outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="avail"
                        checked={editIsAvailable}
                        onChange={(e) => setEditIsAvailable(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="avail" className="font-semibold text-slate-800">Available for Buyer Ordering</label>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                    <button onClick={() => setEditingProduct(null)} className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50">Cancel</button>
                    <button onClick={handleSaveProduct} disabled={savingProduct || uploadingProductImage} className="px-5 py-1.5 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] text-white font-bold text-xs flex items-center space-x-1.5 transition-colors">
                      {savingProduct ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>{savingProduct ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: PRIVATE BUYER MESSAGING (Section 12) */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[600px]">
            
            {/* Buyer Conversations Sidebar */}
            <div className="md:col-span-4 border-r border-slate-100 p-4 overflow-y-auto space-y-2 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Buyer Conversations
              </h3>
              {conversationsList.map((item) => (
                <button
                  key={item.conversation.id}
                  onClick={() => selectChat(item.conversation.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all border ${
                    activeChatConvoId === item.conversation.id
                      ? 'bg-white border-[#4338ca] shadow-2xs'
                      : 'border-transparent hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-[#0f172a] truncate">
                    {item.company?.legalName || item.buyer.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {item.company?.gstin || item.buyer.email}
                  </div>
                </button>
              ))}
            </div>

            {/* Chat Messages Panel */}
            <div className="md:col-span-8 flex flex-col h-full">
              <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
                Direct Private Discussion with Buyer
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#faf8fc]/40">
                {chatMessages.length === 0 ? (
                  <p className="text-center py-16 text-slate-400 text-xs">No messages yet in this conversation.</p>
                ) : (
                  chatMessages.map((m) => {
                    const isMe = m.senderRole === 'admin';
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-[#1e1b4b] text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                          <div className="text-[10px] font-bold opacity-75 mb-0.5">
                            {isMe ? 'Om Rajput (Admin)' : 'Buyer'}
                          </div>
                          {m.messageText}
                          <div className="text-[9px] opacity-60 text-right mt-1">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendChatReply} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                <input
                  type="text"
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder="Reply to buyer privately as company owner..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !adminReplyText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1e1b4b] text-white font-bold text-xs"
                >
                  Send
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
