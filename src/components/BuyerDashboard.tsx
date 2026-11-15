import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  Building,
  MapPin,
  Truck,
  RotateCw,
  Download,
  Send,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  Bell,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { UserProfile, CompanyProfile, Product, OrderFullData, MessageItem, NotificationItem } from '../types/index.ts';

interface BuyerDashboardProps {
  user: UserProfile;
  company: CompanyProfile | null;
  products: Product[];
  onLogout: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  user,
  company,
  products,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'order' | 'orders' | 'documents' | 'messages' | 'profile'>('overview');

  // Orders State
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderFullData | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // New Order Form State
  interface OrderDraftItem {
    productId: number;
    quantityKg: number;
    notes: string;
  }
  const [cartItems, setCartItems] = useState<OrderDraftItem[]>([
    { productId: products[0]?.id || 1, quantityKg: 1000, notes: '' }
  ]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState('');

  // Messaging State
  const [messagesList, setMessagesList] = useState<MessageItem[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [convoId, setConvoId] = useState<number | null>(null);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Notifications State
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);

  // Fetch orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('omr_token') || ''}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrdersList(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch full details of an order
  const loadOrderDetail = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('omr_token') || ''}` },
      });
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error('Failed to load order detail:', err);
    }
  };

  // Fetch private conversation
  const loadMessages = async () => {
    try {
      const res = await fetch('/api/conversations/my', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('omr_token') || ''}` },
      });
      const data = await res.json();
      if (data.conversation) {
        setConvoId(data.conversation.id);
        setMessagesList(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('omr_token') || ''}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotificationsList(data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadMessages();
    loadNotifications();
  }, []);

  // Quick quantity options in KG per Section 7
  const quickQuantities = [
    { label: '500 KG', kg: 500, ton: '0.50 Ton' },
    { label: '1 Ton (1000 KG)', kg: 1000, ton: '1.00 Ton' },
    { label: '1.5 Ton (1500 KG)', kg: 1500, ton: '1.50 Ton' },
    { label: '2 Ton (2000 KG)', kg: 2000, ton: '2.00 Ton' },
    { label: '3 Ton (3000 KG)', kg: 3000, ton: '3.00 Ton' },
  ];

  // Cart operations
  const updateItem = (index: number, field: keyof OrderDraftItem, value: any) => {
    const updated = [...cartItems];
    updated[index] = { ...updated[index], [field]: value };
    setCartItems(updated);
  };

  const addItem = () => {
    setCartItems([...cartItems, { productId: products[0]?.id || 1, quantityKg: 1000, notes: '' }]);
  };

  const removeItem = (index: number) => {
    if (cartItems.length > 1) {
      setCartItems(cartItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotalKg = () => {
    return cartItems.reduce((sum, item) => sum + (Number(item.quantityKg) || 0), 0);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.status !== 'approved') {
      alert('Your company account is pending administrator verification. Orders can only be submitted once approved.');
      return;
    }

    setSubmittingOrder(true);
    setOrderSuccessMessage('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('omr_token') || ''}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantityKg: item.quantityKg,
            notes: item.notes,
          })),
          specialInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order.');
      }

      setOrderSuccessMessage(`Order #${data.orderNumber} successfully registered! Total: ${data.totalKg.toLocaleString()} KG (${data.totalTons} Tons).`);
      setCartItems([{ productId: products[0]?.id || 1, quantityKg: 1000, notes: '' }]);
      setSpecialInstructions('');
      loadOrders();
      loadNotifications();
      setTimeout(() => {
        setActiveTab('orders');
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Error submitting order');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !convoId) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/conversations/${convoId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('omr_token') || ''}`,
        },
        body: JSON.stringify({ messageText: newMessageText }),
      });

      const savedMsg = await res.json();
      setMessagesList([...messagesList, savedMsg]);
      setNewMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleReorder = (order: any) => {
    // Populate cart with order items and switch tab
    loadOrderDetail(order.id).then(() => {
      setActiveTab('order');
    });
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] pb-24">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-200 uppercase tracking-wider">
              <span>B2B Buyer Portal</span>
              <span>•</span>
              <span>Dadra Supply Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {company?.legalName || 'Registered Enterprise Buyer'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-purple-200 mt-2 font-mono">
              <span>GSTIN: <strong>{company?.gstin || 'Pending Verification'}</strong></span>
              <span>•</span>
              <span>State: {company?.state || 'Dadra & Nagar Haveli'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user.status === 'approved' ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                GST Approved Buyer
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Pending Admin Verification
              </span>
            )}

            <button
              onClick={() => setActiveTab('order')}
              className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              + Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1 p-1 bg-white rounded-2xl border border-purple-100 shadow-xs mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'order'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Place New Order
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            My Orders ({ordersList.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'documents'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            My Documents (Invoices & E-Way Bills)
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'messages'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Private Admin Messages
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#1e1b4b] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            GST & Company Profile
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Approval warning if pending */}
            {user.status !== 'approved' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Account Verification in Progress:</span>
                  <p className="mt-0.5">
                    Your GST registration details have been received by OM RAJPUT TRADING COMPANY. The owner is reviewing your tax registration. Once approved, the order placement system will unlock automatically.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-medium">Total Orders Placed</span>
                <div className="text-2xl font-extrabold text-[#0f172a]">{ordersList.length}</div>
                <span className="text-[11px] text-emerald-600 font-semibold">Active Account</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-medium">Total Material Supplied</span>
                <div className="text-2xl font-extrabold text-[#4338ca]">
                  {ordersList
                    .reduce((acc, curr) => acc + parseFloat(curr.order?.totalQuantityKg || '0'), 0)
                    .toLocaleString()}{' '}
                  <span className="text-sm font-normal text-slate-500">KG</span>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {(
                    ordersList.reduce((acc, curr) => acc + parseFloat(curr.order?.totalQuantityKg || '0'), 0) /
                    1000
                  ).toFixed(2)}{' '}
                  Tons
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-medium">Registered GSTIN</span>
                <div className="text-sm font-bold font-mono text-slate-900 truncate">
                  {company?.gstin || 'Pending'}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold">Status: Active</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-medium">Primary Dispatch Hub</span>
                <div className="text-sm font-bold text-slate-900">Dadra Warehouse</div>
                <span className="text-[11px] text-slate-500">Shop No. 2, Survey No. 269</span>
              </div>
            </div>

            {/* Recent Orders & Notifications Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Orders list */}
              <div className="lg:col-span-8 p-6 bg-white rounded-3xl border border-purple-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-[#0f172a]">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#4338ca] font-bold hover:underline"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                {ordersList.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500">No orders placed yet.</p>
                    <button
                      onClick={() => setActiveTab('order')}
                      className="px-4 py-2 rounded-xl bg-[#1e1b4b] text-white text-xs font-bold"
                    >
                      Create Your First Order
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ordersList.slice(0, 3).map((item) => (
                      <div
                        key={item.order.id}
                        className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-sm text-[#0f172a] font-mono">
                            #{item.order.orderNumber}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Total: <strong>{Number(item.order.totalQuantityKg).toLocaleString()} KG</strong> ({item.order.totalQuantityTons} Tons)
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {new Date(item.order.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
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

                          <button
                            onClick={() => {
                              loadOrderDetail(item.order.id);
                              setActiveTab('orders');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                          >
                            Track & Documents
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Notifications sidebar */}
              <div className="lg:col-span-4 p-6 bg-white rounded-3xl border border-purple-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-[#0f172a] flex items-center space-x-1.5">
                    <Bell className="w-4 h-4 text-pink-600" />
                    <span>Website Notifications</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {notificationsList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No new notifications.</p>
                  ) : (
                    notificationsList.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs space-y-1"
                      >
                        <div className="font-bold text-[#1e1b4b]">{notif.title}</div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                        <div className="text-[10px] text-slate-400 pt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ORDER PLACEMENT SYSTEM (Section 7) */}
        {activeTab === 'order' && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <div>
                <h2 className="text-2xl font-extrabold text-[#0f172a]">B2B Order Placement</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select industrial powders or masterbatches with quick palletized tonnage presets.
                </p>
              </div>
            </div>

            {orderSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{orderSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Product items table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Order Items (Multi-Product Supported)
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#4338ca] hover:text-[#312e81]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Product</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item, idx) => {
                    const currentProd = products.find((p) => p.id === item.productId) || products[0];
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Item #{idx + 1}</span>
                          {cartItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          {/* Product select */}
                          <div className="sm:col-span-6">
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                              Select Material Grade
                            </label>
                            <select
                              value={item.productId}
                              onChange={(e) => updateItem(idx, 'productId', parseInt(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.packaging})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity in KG input */}
                          <div className="sm:col-span-6">
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                              Quantity (KG) — {((item.quantityKg || 0) / 1000).toFixed(2)} Tons
                            </label>
                            <input
                              type="number"
                              min={25}
                              step={25}
                              required
                              value={item.quantityKg}
                              onChange={(e) => updateItem(idx, 'quantityKg', parseFloat(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Quantity in KG"
                            />
                          </div>
                        </div>

                        {/* Quick Quantity Presets per Section 7 */}
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            Quick Quantity Presets:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {quickQuantities.map((preset) => (
                              <button
                                key={preset.kg}
                                type="button"
                                onClick={() => updateItem(idx, 'quantityKg', preset.kg)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                  item.quantityKg === preset.kg
                                    ? 'bg-[#1e1b4b] text-white'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary Display */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Calculated Order Weight:</span>
                  <div className="text-lg font-extrabold text-[#1e1b4b]">
                    {calculateTotalKg().toLocaleString()} KG{' '}
                    <span className="text-sm font-semibold text-[#db2777]">
                      ({(calculateTotalKg() / 1000).toFixed(3)} Metric Tons)
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  Approx. {Math.ceil(calculateTotalKg() / 25)} standard 25 KG bags
                </div>
              </div>

              {/* Delivery Address (GST Auto-Snapshotted per Section 7) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>Registered GST Delivery Address (Auto-Snapshotted)</span>
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Official Tax Address
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  {company?.registeredAddress}, {company?.city}, {company?.state} - {company?.pincode}
                </p>
                <div className="text-[11px] text-slate-500">
                  Recipient: <strong>{company?.contactPerson}</strong> ({company?.mobile})
                </div>
              </div>

              {/* Special Dispatch Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Special Transport / Bilty Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Preferred transport agency, timing of factory gate receiving, packaging pallet requirements..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Payment Notice */}
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Offline Terms:</strong> No online payment gateway is used. Payment is handled offline via NEFT/RTGS as per established company credit or advance terms.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingOrder || user.status !== 'approved'}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] hover:from-[#312e81] hover:to-[#db2777] disabled:bg-slate-300 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Order...</span>
                  </>
                ) : (
                  <span>Place Industrial Order</span>
                )}
              </button>

            </form>
          </div>
        )}

        {/* TAB 3: MY ORDERS & ORDER TRACKING (Sections 6 & 9) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* If order selected, show tracking timeline */}
            {selectedOrder && (
              <div className="p-6 bg-white rounded-3xl border border-purple-100 shadow-sm space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500">Order Reference</span>
                    <h3 className="text-xl font-extrabold text-[#0f172a] font-mono">
                      #{selectedOrder.order.orderNumber}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Back to List &times;
                  </button>
                </div>

                {/* 7-Stage Status Tracking Timeline */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
                    Order Status & Tracking Progress
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {[
                      'Pending',
                      'Confirmed',
                      'Processing',
                      'Ready for Dispatch',
                      'Dispatched',
                      'Delivered',
                    ].map((stepName, sIdx) => {
                      const allStatuses = [
                        'Pending',
                        'Confirmed',
                        'Processing',
                        'Ready for Dispatch',
                        'Dispatched',
                        'Delivered',
                      ];
                      const currentIdx = allStatuses.indexOf(selectedOrder.order.status);
                      const isPast = sIdx <= currentIdx;
                      const isCurrent = sIdx === currentIdx;

                      return (
                        <div
                          key={stepName}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'border-[#db2777] bg-pink-50/70 text-pink-900 font-bold ring-2 ring-pink-400/20'
                              : isPast
                              ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 font-semibold'
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                          }`}
                        >
                          <div className="text-[10px] uppercase">{sIdx + 1}. Stage</div>
                          <div className="text-xs mt-0.5">{stepName}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status history logs */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">Audit Status History:</span>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {selectedOrder.history.map((h) => (
                      <div key={h.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-900">{h.newStatus}</strong> — {h.notes}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(h.createdAt).toLocaleString()} by {h.changedByName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded Documents in this order */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
                  <div className="font-bold text-xs uppercase tracking-wider text-[#1e1b4b]">
                    Available Documents (Uploaded by OM RAJPUT TRADING COMPANY Admin)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedOrder.invoices.length > 0 ? (
                      selectedOrder.invoices.map((inv) => (
                        <div key={inv.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{inv.fileName}</div>
                              <div className="text-[10px] text-slate-500">Sales Tax Invoice</div>
                            </div>
                          </div>
                          <a
                            href={inv.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-[#1e1b4b] text-white text-xs font-bold flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 italic p-2">
                        Invoice PDF will be uploaded prior to dispatch.
                      </div>
                    )}

                    {selectedOrder.shippingDocuments.length > 0 ? (
                      selectedOrder.shippingDocuments.map((doc) => (
                        <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Truck className="w-5 h-5 text-pink-600" />
                            <div>
                              <div className="text-xs font-bold text-slate-900">{doc.fileName}</div>
                              <div className="text-[10px] text-slate-500">E-Way Bill</div>
                            </div>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-lg bg-[#1e1b4b] text-white text-xs font-bold flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 italic p-2">
                        E-Way Bill will appear when transport is scheduled.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Orders Table */}
            <div className="p-6 bg-white rounded-3xl border border-purple-100 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-[#0f172a]">All Orders & Reorder</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Order #</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Date</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Weight (KG / Tons)</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-600">Status</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {ordersList.map((item) => (
                      <tr key={item.order.id} className="hover:bg-purple-50/20">
                        <td className="px-4 py-3 font-mono font-bold text-[#1e1b4b]">
                          {item.order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(item.order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {Number(item.order.totalQuantityKg).toLocaleString()} KG ({item.order.totalQuantityTons} Tons)
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            item.order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.order.status === 'Dispatched'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => loadOrderDetail(item.order.id)}
                            className="px-3 py-1 rounded-lg bg-purple-50 text-purple-900 font-bold hover:bg-purple-100"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleReorder(item.order)}
                            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold hover:bg-slate-200"
                          >
                            Reorder
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

        {/* TAB 4: MY DOCUMENTS (Section 10) */}
        {activeTab === 'documents' && (
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-purple-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#0f172a]">My Documents</h2>
              <p className="text-xs text-slate-500 mt-1">
                Official GST sales invoices and E-Way Bills uploaded by OM RAJPUT TRADING COMPANY.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ordersList.map((item) => (
                <div
                  key={item.order.id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#1e1b4b]">
                      Order #{item.order.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    Total: {Number(item.order.totalQuantityKg).toLocaleString()} KG ({item.order.totalQuantityTons} Tons)
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {item.order.confirmationEmailSent ? 'Email Dispatched' : 'Pending dispatch'}
                    </span>
                    <button
                      onClick={() => {
                        loadOrderDetail(item.order.id);
                        setActiveTab('orders');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1e1b4b] text-white text-xs font-bold flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>View & Download PDFs</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PRIVATE BUYER-ADMIN MESSAGES (Section 12) */}
        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-[#4338ca]" />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0f172a]">
                    Private Communication with Company Admin (Om Rajput)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Direct line with owner · Dadra Office
                  </span>
                </div>
              </div>
            </div>

            {/* Message thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#faf8fc]/40">
              {messagesList.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No previous messages. Send a message directly to the company owner.</p>
                </div>
              ) : (
                messagesList.map((msg) => {
                  const isMe = msg.senderRole === 'buyer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#1e1b4b] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-purple-100 shadow-2xs rounded-bl-xs'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-75 mb-1">
                          {isMe ? 'You (Buyer)' : 'Om Rajput (Admin)'}
                        </div>
                        {msg.messageText}
                        <div className="text-[9px] opacity-60 text-right mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type your message regarding order dispatch, material specifications, or delivery..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessageText.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] disabled:bg-slate-300 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                {sendingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-pink-400" />}
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: GST & COMPANY PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#0f172a]">Company & GST Information</h2>
              <p className="text-xs text-slate-500 mt-1">
                Verified business profile used on official invoices and E-Way Bills.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div>
                  <span className="text-slate-500 font-medium">Legal Company Name:</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{company?.legalName}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">15-Digit GSTIN:</span>
                  <div className="font-bold font-mono text-[#1e1b4b] text-sm mt-0.5">{company?.gstin}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-slate-500 font-medium">Registered Business Address:</span>
                <p className="font-semibold text-slate-900 leading-relaxed">
                  {company?.registeredAddress}, {company?.city}, {company?.state} - {company?.pincode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-medium">Authorized Contact Person:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{company?.contactPerson}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Contact Mobile:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{company?.mobile}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Official Business Email:</span>
                <div className="font-bold text-slate-900 mt-0.5">{company?.businessEmail}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                To update your registered GSTIN address, contact the company owner.
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
