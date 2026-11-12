import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, AlertTriangle, Package, Check, ArrowRight, Plus, Crown } from 'lucide-react';

export const StockAlertDrawer: React.FC = () => {
  const {
    stockAlerts,
    isStockAlertOpen,
    setIsStockAlertOpen,
    restockVariant,
    products,
    openProductDetail,
    isSuperAdminUser,
  } = useStore();

  const [restockingId, setRestockingId] = useState<string | null>(null);

  if (!isStockAlertOpen) return null;

  const handleQuickRestock = (productId: string, variantId: string, amount: number) => {
    setRestockingId(variantId);
    restockVariant(productId, variantId, amount);
    setTimeout(() => setRestockingId(null), 1000);
  };

  const handleInspectProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setIsStockAlertOpen(false);
      openProductDetail(prod);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-blue-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-blue-100 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Inventory Stock Alerts</h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white text-blue-800 rounded-full">
                {stockAlerts.length}
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Live triggers for variations depleted below safety thresholds
            </p>
          </div>

          <button
            onClick={() => setIsStockAlertOpen(false)}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {stockAlerts.length > 0 ? (
            stockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-blue-950 block">
                      {alert.productName}
                    </span>
                    <span className="text-[11px] text-blue-800 font-mono block">
                      {alert.variantName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Code: {alert.sku}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      alert.severity === 'critical'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {alert.severity === 'critical' ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-blue-100">
                  <div className="font-mono text-slate-600">
                    Units left: <strong className="text-slate-900 font-bold">{alert.currentStock}</strong> (Limit: {alert.threshold})
                  </div>

                  {isSuperAdminUser && (
                    <button
                      type="button"
                      onClick={() => handleQuickRestock(alert.productId, alert.variantId, 25)}
                      disabled={restockingId === alert.variantId}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      {restockingId === alert.variantId ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>+25 Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Restock 25</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-blue-950">Inventory Healthy</p>
              <p className="text-xs text-slate-500">All variations meet safety stock quantities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
