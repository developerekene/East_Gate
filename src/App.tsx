/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { StoreProvider, useStore } from './context/StoreContext';
import { EastGateLogo } from './components/EastGateLogo';
import { ToastContainer } from './components/ToastContainer';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Navbar } from './components/Navbar';
import { ProductList } from './components/ProductList';
import { InventoryDashboard } from './components/InventoryDashboard';
import { OrdersView } from './components/OrdersView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PaystackModal } from './components/PaystackModal';
import { StockAlertDrawer } from './components/StockAlertDrawer';
import { CartDrawer } from './components/CartDrawer';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { DisputeResolutionView } from './components/DisputeResolutionView';
import { CreateDisputeModal } from './components/CreateDisputeModal';
import { Mail, Compass } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    selectedProduct,
    closeProductDetail,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
  } = useStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F6FF] via-[#FAFAFA] to-[#F0F6FF] text-slate-900 flex flex-col font-sans antialiased selection:bg-[#0B2545] selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAuthModalOpen ? (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authModalMode}
          />
        ) : selectedProduct ? (
          <ProductDetailModal
            product={selectedProduct}
            onClose={closeProductDetail}
          />
        ) : (
          <>
            {activeTab === 'catalog' && <ProductList />}
            {activeTab === 'inventory' && <InventoryDashboard />}
            {activeTab === 'orders' && <OrdersView />}
            {activeTab === 'disputes' && <DisputeResolutionView />}
          </>
        )}
      </main>

      {/* Secure Payment Gateway Simulator Modal */}
      <PaystackModal />

      {/* Low-Stock Notification Drawer */}
      <StockAlertDrawer />

      {/* Shopping Cart Slide-over Drawer */}
      <CartDrawer />

      {/* User Profile Modal */}
      <ProfileModal />

      {/* Dispute & Feedback Creation Modal */}
      <CreateDisputeModal />

      {/* Extensive Site Footer */}
      <footer className="mt-auto border-t border-blue-900/15 bg-[#0B2545] text-blue-100 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand & Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <EastGateLogo className="w-8 h-8" />
                <span className="font-black text-xl tracking-tight text-white">
                  East Gate
                </span>
              </div>
              <p className="text-blue-200/80 leading-relaxed max-w-sm">
                Direct sole-seller commerce delivering quality wearables, flagship devices, and electronics with transparent pricing.
              </p>
            </div>

            {/* Vision */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-[11px]">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Our Vision</span>
              </div>
              <p className="text-blue-200/80 leading-relaxed">
                To set the standard for direct-to-buyer commerce—combining uncompromising product quality, real-time stock transparency, and seamless shopping without middlemen.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-[11px]">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Contact & Support</span>
              </div>
              <div className="space-y-2 text-blue-200/90">
                <p>
                  Email:{' '}
                  <a
                    href="mailto:support@eastgate.com"
                    className="font-semibold text-white hover:text-blue-300 underline underline-offset-2 transition-colors"
                  >
                    support@eastgate.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-blue-300/80">
            <p className="font-medium">
              © {new Date().getFullYear()} East Gate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <ToastContainer />
      <LoadingOverlay />
    </div>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </Provider>
  );
}
