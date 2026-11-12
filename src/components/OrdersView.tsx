import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { formatPrice } from '../utils/currency';
import {
  History,
  Search,
  Check,
  Copy,
  Receipt,
  CreditCard,
  X,
  ShieldCheck,
  Sparkles,
  LifeBuoy,
  Crown,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { orders, currency, openDisputeForOrder, user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'retail' | 'wholesale'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (tierFilter !== 'all' && o.buyerTier !== tierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = o.reference.toLowerCase().includes(q);
        const matchesCustomer =
          o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q);
        const matchesProduct =
          o.productName.toLowerCase().includes(q) || o.variantName.toLowerCase().includes(q);
        const matchesSku = o.sku.toLowerCase().includes(q);
        if (!matchesRef && !matchesCustomer && !matchesProduct && !matchesSku) return false;
      }
      return true;
    });
  }, [orders, tierFilter, searchQuery]);

  const totalVolume = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-blue-100 p-5 rounded-3xl shadow-xs">
          <div className="text-xs text-blue-800 font-mono flex items-center justify-between font-bold">
            <span>Verified Orders</span>
            <ShieldCheck className="w-4 h-4 text-blue-800" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold font-mono text-blue-950 tabular-nums">
            {orders.length}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Secure Checkout
          </div>
        </div>

        <div className="bg-white border border-blue-100 p-5 rounded-3xl shadow-xs">
          <div className="text-xs text-blue-800 font-mono flex items-center justify-between font-bold">
            <span>Gross Order Volume</span>
            <Sparkles className="w-4 h-4 text-blue-800" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold font-mono text-blue-950 tabular-nums">
            {formatPrice(totalRevenue, currency)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Confirmed transactions
          </div>
        </div>

        <div className="bg-white border border-blue-100 p-5 rounded-3xl shadow-xs">
          <div className="text-xs text-blue-800 font-mono flex items-center justify-between font-bold">
            <span>Total Units Dispatched</span>
            <History className="w-4 h-4 text-blue-800" />
          </div>
          <div className="mt-1.5 text-2xl font-extrabold font-mono text-blue-950 tabular-nums">
            {totalVolume} units
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Across wholesale & retail
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order reference, customer, or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200/80 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-blue-800 shadow-xs"
          />
        </div>

        <div className="flex items-center bg-blue-50/80 p-1 rounded-2xl text-xs border border-blue-200">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              tierFilter === 'all' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            All Tiers
          </button>
          <button
            onClick={() => setTierFilter('wholesale')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              tierFilter === 'wholesale' ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Wholesale
          </button>
          <button
            onClick={() => setTierFilter('retail')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              tierFilter === 'retail' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Retail
          </button>
        </div>
      </div>

      {/* Main Ledger Content */}
      <div className="bg-white border border-blue-100 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-blue-50/80 border-b border-blue-100 text-blue-950 font-mono text-[11px]">
                <th className="py-3 px-4 font-bold">Reference</th>
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">Customer</th>
                <th className="py-3 px-4 font-bold">Product & Variant</th>
                <th className="py-3 px-3 font-bold text-center">Tier</th>
                <th className="py-3 px-3 font-bold text-center">Quantity</th>
                <th className="py-3 px-4 font-bold text-right">Total Amount</th>
                <th className="py-3 px-4 font-bold">Payment Channel</th>
                <th className="py-3 px-3 font-bold text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100/60">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-950">
                      <div className="flex items-center gap-1.5">
                        <span>{o.reference}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyRef(o.reference)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                          title="Copy reference code"
                        >
                          {copiedRef === o.reference ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">
                      {o.timestamp}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800">
                      <div className="font-semibold text-slate-900">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{o.customerEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium">{o.productName}</div>
                      <div className="text-[11px] text-blue-800 font-mono">{o.variantName}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold uppercase ${
                          o.buyerTier === 'wholesale'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {o.buyerTier}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                      {o.quantity} pcs
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-blue-800">
                      {formatPrice(o.totalAmount, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-blue-800" />
                        <span>{o.paystackChannel.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(o)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-mono text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500 bg-blue-50/20">
                    <div className="flex flex-col items-center gap-2">
                      <History className="w-8 h-8 text-blue-300" />
                      <p className="text-sm font-bold text-blue-950">No orders recorded yet</p>
                      <p className="text-xs text-slate-400">
                        When transactions complete via checkout, receipts populate directly into this verified ledger.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-blue-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">Official Order Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                <span className="text-slate-500">Transaction Reference:</span>
                <span className="font-mono font-bold text-blue-950">{selectedReceipt.reference}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                <span className="text-slate-500">Purchaser:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                <span className="text-slate-500">Item:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.productName} ({selectedReceipt.variantName})</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-blue-100">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceipt.quantity} Units</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-blue-100 text-sm font-bold text-blue-950">
                <span>Total Amount Paid:</span>
                <span className="font-mono text-blue-800 text-base">{formatPrice(selectedReceipt.totalAmount, currency)}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    openDisputeForOrder(selectedReceipt);
                    setSelectedReceipt(null);
                  }}
                  className="flex-1 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>Report Issue on Order</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-800 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
