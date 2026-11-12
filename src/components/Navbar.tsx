import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { EastGateLogo } from './EastGateLogo';
import {
  Bell,
  Menu,
  X,
  User,
  ShoppingBag,
  LogIn,
  UserPlus,
  Crown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stockAlerts,
    setIsStockAlertOpen,
    buyerTier,
    setBuyerTier,
    currency,
    setCurrency,
    cart,
    disputes,
    setIsCartOpen,
    setIsProfileOpen,
    user,
    isSuperAdminUser,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalAlertsCount = stockAlerts.length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeDisputesCount = disputes.filter(
    (d) => d.status === 'open' || d.status === 'under_review'
  ).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (tab: 'catalog' | 'inventory' | 'orders' | 'disputes') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand Wordmark - East Gate */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('catalog')}
              className="text-left group cursor-pointer focus:outline-none flex items-center gap-2.5"
              aria-label="East Gate Home"
            >
              <EastGateLogo className="w-8 h-8" />
              <span className="font-black text-2xl tracking-tight text-[#0B2545] group-hover:text-[#1E3A8A] transition-colors">
                East Gate
              </span>
            </button>
          </div>

          {/* Zone 2: Primary navigation links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <button
              onClick={() => handleNavClick('catalog')}
              className={`hover:text-[#0B2545] transition-colors cursor-pointer py-1 whitespace-nowrap shrink-0 ${
                activeTab === 'catalog'
                  ? 'text-[#0B2545] border-b-2 border-[#0B2545] font-bold'
                  : 'text-slate-600'
              }`}
            >
              Catalog
            </button>

            {isSuperAdminUser && (
              <button
                onClick={() => handleNavClick('inventory')}
                className={`hover:text-[#0B2545] transition-colors cursor-pointer py-1 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  activeTab === 'inventory'
                    ? 'text-[#0B2545] border-b-2 border-[#0B2545] font-bold'
                    : 'text-slate-600'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Inventory Control</span>
                {totalAlertsCount > 0 && (
                  <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded font-semibold border border-blue-200">
                    {totalAlertsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => handleNavClick('orders')}
              className={`hover:text-[#0B2545] transition-colors cursor-pointer py-1 whitespace-nowrap shrink-0 ${
                activeTab === 'orders'
                  ? 'text-[#0B2545] border-b-2 border-[#0B2545] font-bold'
                  : 'text-slate-600'
              }`}
            >
              Order Ledger
            </button>

            <button
              onClick={() => handleNavClick('disputes')}
              className={`hover:text-[#0B2545] transition-colors cursor-pointer py-1 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'disputes'
                  ? 'text-[#0B2545] border-b-2 border-[#0B2545] font-bold'
                  : 'text-slate-600'
              }`}
            >
              <span>Resolution Center</span>
              {activeDisputesCount > 0 && (
                <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded font-semibold border border-blue-200">
                  {activeDisputesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Wholesale vs Retail Pricing Tier Selector */}
            <div className="flex items-center bg-blue-50/80 p-0.5 rounded-xl border border-blue-200 text-xs">
              <button
                onClick={() => setBuyerTier('retail')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  buyerTier === 'retail'
                    ? 'bg-white text-[#0B2545] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Standard retail pricing"
              >
                Retail
              </button>
              <button
                onClick={() => setBuyerTier('wholesale')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  buyerTier === 'wholesale'
                    ? 'bg-gradient-to-r from-[#0B2545] to-[#1E3A8A] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Wholesale tier with volume discount pricing"
              >
                Wholesale
              </button>
            </div>

            {/* Currency selector */}
            <div className="flex items-center bg-blue-50/80 p-0.5 rounded-xl border border-blue-200 text-xs font-mono">
              <button
                onClick={() => setCurrency('NGN')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  currency === 'NGN'
                    ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₦ NGN
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-white text-[#0B2545] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Low-Stock Notification Bell (Super admin) */}
            {isSuperAdminUser && (
              <button
                onClick={() => setIsStockAlertOpen(true)}
                className="relative p-2 text-slate-700 hover:text-[#0B2545] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-blue-100"
                aria-label="View stock alert notifications"
                title="Low Stock Alerts"
              >
                <Bell className="w-4 h-4" />
                {totalAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1E3A8A] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {totalAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Icon ONLY shown when user is logged in */}
            {user ? (
              <button
                onClick={() => setIsProfileOpen(true)}
                className={`p-2 rounded-xl transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  isSuperAdminUser
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                    : 'text-slate-700 hover:text-[#0B2545] hover:bg-blue-50 border-blue-100'
                }`}
                aria-label="View user profile"
                title={user.email || 'Profile'}
              >
                {isSuperAdminUser ? (
                  <Crown className="w-4 h-4 text-amber-600" />
                ) : (
                  <User className="w-4 h-4 text-[#0B2545]" />
                )}
                <span className="text-xs font-bold max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-[#0B2545] hover:bg-blue-50 rounded-xl transition-colors border border-blue-200 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0B2545] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-[#1D4ED8] rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Cart Icon (Desktop) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:text-[#0B2545] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-blue-100"
              aria-label="View shopping cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#0B2545] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            {/* Profile Icon ONLY shown when user is logged in */}
            {user && (
              <button
                onClick={() => setIsProfileOpen(true)}
                className="p-2 text-slate-700 hover:text-[#0B2545] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-blue-100 min-w-[38px] min-h-[38px] flex items-center justify-center"
                aria-label="View Profile"
              >
                {isSuperAdminUser ? (
                  <Crown className="w-4 h-4 text-amber-600" />
                ) : (
                  <User className="w-4 h-4 text-[#0B2545]" />
                )}
              </button>
            )}

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:text-[#0B2545] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-blue-100 min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="View cart"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#0B2545] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#0B2545] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-blue-100 min-w-[38px] min-h-[38px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-800/20"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#0B2545]" />
              ) : (
                <Menu className="w-5 h-5 text-[#0B2545]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Menu: only Sign In and Sign Up buttons */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-blue-100 bg-white/98 backdrop-blur-lg shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="px-5 py-6 space-y-4 max-w-md mx-auto">
            {user ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#0B2545] flex items-center gap-1.5">
                      {isSuperAdminUser && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                      <span>{user.displayName || 'Signed In Member'}</span>
                    </div>
                    <div className="text-[11px] text-blue-900 font-mono truncate max-w-[200px]">
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 bg-white text-[#0B2545] border border-blue-200 rounded-xl text-xs font-bold"
                  >
                    Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center pb-1">
                  <h4 className="text-sm font-bold text-[#0B2545]">Account Access</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sign in or register for direct wholesale pricing and order management.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setAuthModalMode('signin');
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-blue-50 text-[#0B2545] border border-blue-300 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthModalMode('signup');
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#0B2545] via-[#1E3A8A] to-[#1D4ED8] hover:from-[#1E3A8A] hover:to-[#1D4ED8] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
