import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DisputeTicket, DisputeStatus } from '../types';
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  Send,
  User,
  Store,
  ChevronRight,
  Package,
  AlertCircle,
  Plus,
  X,
  RefreshCw,
  Sparkles,
  Crown,
} from 'lucide-react';

export const DisputeResolutionView: React.FC = () => {
  const {
    disputes,
    resolveDispute,
    sendDisputeMessage,
    setIsCreateDisputeOpen,
    isSuperAdminUser,
    user,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'under_review' | 'resolved' | 'closed'>('all');
  const [selectedTicket, setSelectedTicket] = useState<DisputeTicket | null>(null);

  // Message compose form state
  const [replyText, setReplyText] = useState('');
  const [replyRole, setReplyRole] = useState<'buyer' | 'seller'>('seller');
  const [replacementTracking, setReplacementTracking] = useState('');
  const [showReplacementPrompt, setShowReplacementPrompt] = useState(false);

  const activeTicket = useMemo(() => {
    if (!selectedTicket) return null;
    return disputes.find((t) => t.id === selectedTicket.id) || selectedTicket;
  }, [disputes, selectedTicket]);

  const filteredTickets = useMemo(() => {
    return disputes.filter((t) => {
      if (statusFilter === 'open' && t.status !== 'open') return false;
      if (statusFilter === 'under_review' && t.status !== 'under_review') return false;
      if (
        statusFilter === 'resolved' &&
        t.status !== 'resolved_refund' &&
        t.status !== 'resolved_replacement'
      ) {
        return false;
      }
      if (statusFilter === 'closed' && t.status !== 'closed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTicket = t.ticketNumber.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q);
        const matchesCustomer =
          t.customerName.toLowerCase().includes(q) || t.customerEmail.toLowerCase().includes(q);
        const matchesOrder = t.orderReference?.toLowerCase().includes(q) ?? false;
        if (!matchesTicket && !matchesSubject && !matchesCustomer && !matchesOrder) return false;
      }
      return true;
    });
  }, [disputes, statusFilter, searchQuery]);

  const totalOpen = disputes.filter((t) => t.status === 'open' || t.status === 'under_review').length;
  const totalResolved = disputes.filter(
    (t) => t.status === 'resolved_refund' || t.status === 'resolved_replacement' || t.status === 'closed'
  ).length;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    const senderName = replyRole === 'seller' ? 'Direct Sole Seller Support' : activeTicket.customerName;
    sendDisputeMessage(activeTicket.id, replyRole, senderName, replyText.trim());
    setReplyText('');
  };

  const handleRefundResolution = () => {
    if (!activeTicket) return;
    resolveDispute(
      activeTicket.id,
      'resolved_refund',
      `Full electronic refund approved and credited back to ${activeTicket.customerEmail}. Encrypted transaction reversal verified.`
    );
  };

  const handleReplacementResolution = () => {
    if (!activeTicket) return;
    const tracking = replacementTracking.trim() || `DHL-EXP-${Math.floor(100000 + Math.random() * 900000)}`;
    resolveDispute(
      activeTicket.id,
      'resolved_replacement',
      `Brand new replacement unit dispatched via express priority delivery. Courier Tracking: ${tracking}.`
    );
    setShowReplacementPrompt(false);
    setReplacementTracking('');
  };

  const handleCloseTicket = () => {
    if (!activeTicket) return;
    resolveDispute(
      activeTicket.id,
      'closed',
      'Ticket closed with mutual satisfaction confirmed between buyer and store owner.'
    );
  };

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-800 animate-pulse" />
            Open
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Under Review
          </span>
        );
      case 'resolved_refund':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Refund Issued
          </span>
        );
      case 'resolved_replacement':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
            <Package className="w-3 h-3 text-blue-800" />
            Replacement Dispatched
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Pink Top Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 rounded-3xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-white" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-100">
              Direct Sole Seller Resolution Center
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Complaints, Disputes & Verified Ticket Tracking
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
            Direct dispute settlement with the sole store seller. No third-party friction or bureaucratic delays.
          </p>
        </div>

        <button
          onClick={() => setIsCreateDisputeOpen(true)}
          className="px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Complaint</span>
        </button>
      </div>

      {/* Ticket List and Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List (Left) */}
        <div className="lg:col-span-5 bg-white border border-blue-100 rounded-3xl p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, customer, or order..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeTicket?.id === t.id
                      ? 'bg-blue-50/80 border-blue-800 ring-1 ring-blue-800'
                      : 'bg-white border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-blue-950">{t.ticketNumber}</span>
                    {getStatusBadge(t.status)}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 mt-1 line-clamp-1">{t.subject}</h4>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between font-mono">
                    <span>{t.customerName}</span>
                    <span>{t.createdAt.split(' ')[0]}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-1">
                <LifeBuoy className="w-8 h-8 text-blue-300 mx-auto" />
                <p className="text-xs font-bold text-blue-950">No tickets found</p>
                <p className="text-[11px] text-slate-400">All customer inquiries resolved.</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversation & Action Pane (Right) */}
        <div className="lg:col-span-7 bg-white border border-blue-100 rounded-3xl p-6 shadow-xs min-h-[500px]">
          {activeTicket ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between border-b border-blue-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-800">{activeTicket.ticketNumber}</span>
                    {getStatusBadge(activeTicket.status)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{activeTicket.subject}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Filed by <span className="font-semibold text-slate-700">{activeTicket.customerName}</span> ({activeTicket.customerEmail})
                  </div>
                </div>

                {isSuperAdminUser && activeTicket.status !== 'closed' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleRefundResolution}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 cursor-pointer"
                    >
                      Issue Refund
                    </button>
                    <button
                      onClick={() => setShowReplacementPrompt(true)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-100 cursor-pointer"
                    >
                      Send Replacement
                    </button>
                  </div>
                )}
              </div>

              {showReplacementPrompt && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-blue-950 block">Enter Replacement Express Tracking Number:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replacementTracking}
                      onChange={(e) => setReplacementTracking(e.target.value)}
                      placeholder="e.g. DHL-EXP-849120"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={handleReplacementResolution}
                      className="px-3 py-1.5 bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs"
                    >
                      Confirm Dispatch
                    </button>
                  </div>
                </div>
              )}

              {/* Message History */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {activeTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                      m.sender === 'seller'
                        ? 'bg-gradient-to-r from-blue-50 to-blue-50/60 border border-blue-200 ml-6 text-blue-950'
                        : 'bg-slate-50 border border-slate-200 mr-6 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-bold flex items-center gap-1">
                        {m.sender === 'seller' ? <Store className="w-3 h-3 text-blue-800" /> : <User className="w-3 h-3 text-slate-500" />}
                        {m.senderName}
                      </span>
                      <span className="text-slate-400">{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{m.message}</p>
                  </div>
                ))}
              </div>

              {/* Message Reply Input */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Posting reply as:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReplyRole('seller')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        replyRole === 'seller' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Sole Seller Support
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyRole('buyer')}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        replyRole === 'buyer' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Buyer
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type message directly..."
                    className="flex-1 px-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full py-28 flex flex-col items-center justify-center text-center space-y-2">
              <LifeBuoy className="w-10 h-10 text-blue-300 stroke-1" />
              <h4 className="text-sm font-bold text-blue-950">Select a Ticket</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Select an issue on the left to read messages, provide seller resolutions, or communicate in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
