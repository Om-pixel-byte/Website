import React, { useState } from 'react';
import {
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Search,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  Sparkles
} from 'lucide-react';
import { GSTVerificationResult } from '../server/gst-service.ts';

interface GSTRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const GSTRegisterModal: React.FC<GSTRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const [gstin, setGstin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState<GSTVerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState('');

  // Form Fields
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerifyGSTIN = async () => {
    const cleanGstin = gstin.trim().toUpperCase();
    if (!cleanGstin || cleanGstin.length !== 15) {
      setVerifyError('Please enter a valid 15-character GSTIN.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/gst/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gstin: cleanGstin }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'GSTIN verification failed.');
      }

      setVerificationData(data);
      setLegalName(data.legalName || '');
      setTradeName(data.tradeName || '');
      setRegisteredAddress(data.registeredAddress || '');
      setCity(data.city || '');
      setState(data.state || '');
      setPincode(data.pincode || '');
    } catch (err: any) {
      setVerifyError(err.message || 'Error communicating with GST verification system.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationData) {
      setSubmitError('Please verify your 15-digit GSTIN first.');
      return;
    }

    if (!contactPerson || !mobile || !businessEmail) {
      setSubmitError('Contact person name, mobile, and business email are mandatory.');
      return;
    }

    if (!password || password.length < 6) {
      setSubmitError('Please create a password of at least 6 characters for portal sign-in.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/auth/register-gst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstin: gstin.trim().toUpperCase(),
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
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit registration.');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper to fill test GSTINs for demonstration
  const fillSampleGSTIN = (sample: string) => {
    setGstin(sample);
    setVerifyError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1e1b4b] to-[#312e81] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-pink-400" />
            <h3 className="font-bold text-base">B2B Buyer Registration with GSTIN</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Registration Submitted Successfully!</h4>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your company credentials for <strong>{legalName}</strong> have been logged. The business administrator will review your GSTIN status. Once approved, you can place orders directly from your portal.
            </p>
            <div className="p-3 bg-purple-50 rounded-xl text-xs text-[#1e1b4b] font-medium border border-purple-100 max-w-md mx-auto">
              Notification sent to OM RAJPUT TRADING COMPANY owner.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Step 1: GSTIN Input & Verification */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>1. Enter 15-Digit GSTIN</span>
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Format: 26AAAAA0000A1Z5</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 26AABCP1234D1Z2"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-wider uppercase focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={handleVerifyGSTIN}
                  disabled={isVerifying || gstin.trim().length !== 15}
                  className="px-5 py-2.5 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] disabled:bg-slate-300 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shrink-0"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Verify GSTIN</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample Quick GSTIN buttons for easy testing */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <span className="font-medium text-slate-600">Sample active buyers:</span>
                <button
                  type="button"
                  onClick={() => fillSampleGSTIN('26AABCP1234D1Z2')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-purple-300 text-purple-900 font-mono text-[10px]"
                >
                  Dadra Polyfilms (26AABCP1234D1Z2)
                </button>
                <button
                  type="button"
                  onClick={() => fillSampleGSTIN('24AAACR5432M1Z8')}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-purple-300 text-purple-900 font-mono text-[10px]"
                >
                  Vapi Compounds (24AAACR5432M1Z8)
                </button>
              </div>

              {verifyError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {verificationData && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>GSTIN Verified: {verificationData.legalName}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Status: <strong>{verificationData.gstStatus}</strong> · State: {verificationData.state}
                  </div>
                  {verificationData.message && (
                    <div className="text-[10px] text-slate-500 italic mt-1 border-t border-emerald-200/50 pt-1">
                      {verificationData.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Auto-filled Company Details from GST */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>2. Registered Business Address (Auto-Fetched)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Legal Company Name *</label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Legal name as registered on GST portal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Trade Name (Optional)</label>
                  <input
                    type="text"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    placeholder="Trade name if different"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 font-medium mb-1">Registered Business Address *</label>
                <textarea
                  required
                  rows={2}
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  placeholder="Official factory / office address as on GST registration"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City / GIDC</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="PIN"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Contact Person & Portal Credentials */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-purple-600" />
                <span>3. Authorized Contact Person & Portal Access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Patel (Procurement Head)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mobile Number (WhatsApp/Dispatch) *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Official Business Email *</label>
                  <input
                    type="email"
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="purchase@company.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Create Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs text-[#4338ca] hover:underline font-medium"
              >
                Already have an approved account? Sign In
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !verificationData}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] hover:from-[#312e81] hover:to-[#db2777] disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Business Registration</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
