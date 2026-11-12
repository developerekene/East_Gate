import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  User,
  ShieldCheck,
  Layers,
  History,
  CheckCircle2,
  LifeBuoy,
  LogOut,
  Crown,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    user,
    isSuperAdminUser,
    signOutUser,
    buyerTier,
    setBuyerTier,
    setActiveTab,
    orders,
    disputes,
    cart,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useStore();

  if (!isProfileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-blue-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {isSuperAdminUser ? (
                <Crown className="w-6 h-6 text-amber-300" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">
                  {user ? user.displayName || 'Registered Member' : 'Guest Shopper'}
                </h3>
                {isSuperAdminUser && (
                  <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-md">
                    Super Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 font-mono truncate max-w-[220px]">
                {user ? user.email : 'Not signed in'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileOpen(false)}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Account Status / Super Admin Notice */}
          <div className="p-4 bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-blue-50/60 border border-blue-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Access Level</span>
              {isSuperAdminUser ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span>Full Rights Super Admin</span>
                </span>
              ) : user ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-900 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-blue-800" />
                  <span>Verified Firebase Account</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  <span>Guest Visitor</span>
                </span>
              )}
            </div>

            {isSuperAdminUser && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-mono">
                👑 <strong>Super Admin Console Active:</strong> You have unlimited administrative privileges to edit product specs, modify pricing, alter stock quantities, and manage disputes.
              </div>
            )}

            {/* Pricing Mode Toggle */}
            <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">Catalog Pricing Mode:</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-blue-200 text-xs font-semibold">
                <button
                  onClick={() => setBuyerTier('retail')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    buyerTier === 'retail'
                      ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Retail
                </button>
                <button
                  onClick={() => setBuyerTier('wholesale')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    buyerTier === 'wholesale'
                      ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Wholesale
                </button>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-800 font-bold block">
              Quick Shortcuts
            </span>

            <button
              onClick={() => {
                setActiveTab('orders');
                setIsProfileOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/50 border border-blue-100 rounded-2xl transition-colors cursor-pointer text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-blue-800" />
                <span className="font-medium">Order History & Receipts</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 font-bold">
                {orders.length} orders
              </span>
            </button>

            {isSuperAdminUser && (
              <button
                onClick={() => {
                  setActiveTab('inventory');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/50 border border-blue-100 rounded-2xl transition-colors cursor-pointer text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-blue-800" />
                  <span className="font-medium">Inventory Control & Stock</span>
                </div>
                <span className="text-[11px] text-blue-800 font-mono font-bold">Admin Only</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('disputes');
                setIsProfileOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/50 border border-blue-100 rounded-2xl transition-colors cursor-pointer text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <LifeBuoy className="w-4 h-4 text-blue-800" />
                <span className="font-medium">Resolution & Customer Support</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 font-bold">
                {disputes.length} tickets
              </span>
            </button>
          </div>

          {/* User Auth Action (Sign In vs Sign Out) */}
          <div className="pt-3 border-t border-blue-100 space-y-3">
            {user ? (
              <button
                onClick={async () => {
                  await signOutUser();
                  setIsProfileOpen(false);
                }}
                className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-blue-200"
              >
                <LogOut className="w-4 h-4 text-blue-800" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="py-2.5 px-3 bg-white border border-blue-300 hover:bg-blue-50 text-blue-800 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer shadow-xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="py-2.5 px-3 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-800 text-white font-bold text-xs rounded-xl transition-colors text-center cursor-pointer shadow-md"
                >
                  Create Account
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-blue-900/70 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
              <span>Secure Checkout · Sole Seller Direct Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
