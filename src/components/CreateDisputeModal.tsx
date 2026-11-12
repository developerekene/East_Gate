import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { DisputeCategory, PreferredResolution } from '../types';
import {
  X,
  LifeBuoy,
  ShieldCheck,
  AlertCircle,
  Package,
  Send,
  RotateCcw,
} from 'lucide-react';

export const CreateDisputeModal: React.FC = () => {
  const {
    isCreateDisputeOpen,
    setIsCreateDisputeOpen,
    prefilledDisputeOrder,
    orders,
    fileDispute,
    setActiveTab,
    user,
  } = useStore();

  const [selectedOrderRef, setSelectedOrderRef] = useState<string>('');
  const [customerName, setCustomerName] = useState(user?.displayName || 'Valued Buyer');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'buyer@example.com');
  const [category, setCategory] = useState<DisputeCategory>('quality_defect');
  const [preferredResolution, setPreferredResolution] = useState<PreferredResolution>('refund');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submittedTicketNo, setSubmittedTicketNo] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledDisputeOrder) {
      setSelectedOrderRef(prefilledDisputeOrder.reference);
      setCustomerName(prefilledDisputeOrder.customerName || user?.displayName || 'Valued Buyer');
      setCustomerEmail(prefilledDisputeOrder.customerEmail || user?.email || 'buyer@example.com');
      setSubject(`Order Issue: ${prefilledDisputeOrder.productName} (${prefilledDisputeOrder.reference})`);
    } else if (orders.length > 0) {
      setSelectedOrderRef(orders[0].reference);
      setCustomerName(orders[0].customerName || user?.displayName || 'Valued Buyer');
      setCustomerEmail(orders[0].customerEmail || user?.email || 'buyer@example.com');
      setSubject('');
    } else {
      setCustomerName(user?.displayName || 'Valued Buyer');
      setCustomerEmail(user?.email || 'buyer@example.com');
    }
  }, [prefilledDisputeOrder, orders, user]);

  if (!isCreateDisputeOpen) return null;

  const currentOrder = orders.find((o) => o.reference === selectedOrderRef);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const ticket = fileDispute({
      orderReference: selectedOrderRef || undefined,
      productId: currentOrder?.productId,
      productName: currentOrder?.productName,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      category,
      subject: subject.trim(),
      description: description.trim(),
      preferredResolution,
    });

    setSubmittedTicketNo(ticket.ticketNumber);
  };

  const handleClose = () => {
    setIsCreateDisputeOpen(false);
    setSubmittedTicketNo(null);
    setSubject('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-blue-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white">
          <div className="flex items-center gap-2.5">
            <LifeBuoy className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold">Report an Issue or File Dispute</h3>
              <p className="text-xs text-blue-100 font-mono">Direct Sole Seller Settlement</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedTicketNo ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center mx-auto border border-blue-200">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-blue-950">Dispute Ticket Logged Successfully</h4>
              <p className="text-xs text-slate-500 mt-1 font-mono">Ticket Number: {submittedTicketNo}</p>
            </div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your ticket has been placed directly into the Resolution Center. The sole seller will review and issue replacements, refunds, or technical support directly.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleClose();
                  setActiveTab('disputes');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Go to Resolution Center
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {orders.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                  Select Associated Order (Optional)
                </label>
                <select
                  value={selectedOrderRef}
                  onChange={(e) => setSelectedOrderRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800 font-mono"
                >
                  <option value="">-- No specific order / General inquiry --</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.reference}>
                      {o.reference} — {o.productName} ({o.variantName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                  Complaint Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DisputeCategory)}
                  className="w-full px-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800 font-mono"
                >
                  <option value="quality_defect">Quality / Defect Issue</option>
                  <option value="delayed_delivery">Delayed Shipping</option>
                  <option value="wrong_item">Wrong Variant Received</option>
                  <option value="damaged_packaging">Damaged Package</option>
                  <option value="billing_payment">Payment / Invoice Inquiry</option>
                  <option value="general_complaint">General Complaint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                  Preferred Resolution
                </label>
                <select
                  value={preferredResolution}
                  onChange={(e) => setPreferredResolution(e.target.value as PreferredResolution)}
                  className="w-full px-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800 font-mono"
                >
                  <option value="refund">Direct Electronic Refund</option>
                  <option value="replacement">Express Replacement Unit</option>
                  <option value="store_credit">Store Voucher Credit</option>
                  <option value="explanation">Explanation & Assistance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                Subject / Summary
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Earbud left audio channel static"
                className="w-full px-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">
                Detailed Description
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in full detail..."
                className="w-full px-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800 resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-blue-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>File Direct Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
