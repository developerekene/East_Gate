import React, { useState } from 'react';
import { Product, ProductVariation } from '../types';
import { useStore } from '../context/StoreContext';
import { X, Plus, Trash2, Save, AlertCircle, Crown, ShieldCheck } from 'lucide-react';

interface ProductEditModalProps {
  product: Product;
  isOpen?: boolean;
  onClose: () => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({ product, isOpen = true, onClose }) => {
  const { updateProduct, isSuperAdminUser } = useStore();

  const [formData, setFormData] = useState<Product>({ ...product });
  const [variations, setVariations] = useState<ProductVariation[]>(
    product.variations.map((v) => ({ ...v }))
  );
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  if (!isSuperAdminUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full border border-blue-100 p-6 text-center shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Super Admin Access Required</h3>
            <p className="text-xs text-slate-600 mt-1">
              Only the sole verified super admin (<strong>ekenehq@gmail.com</strong>) has permissions to modify product specifications, variations, and pricing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleVariantChange = (index: number, field: keyof ProductVariation, value: any) => {
    setVariations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddVariation = () => {
    const newId = `var-${Date.now()}`;
    const newVariation: ProductVariation = {
      id: newId,
      name: `Variation ${variations.length + 1}`,
      sku: `${formData.id.toUpperCase()}-VAR-${variations.length + 1}`,
      stock: 10,
      lowStockThreshold: 5,
      priceDeltaRetail: 0,
      priceDeltaWholesale: 0,
      attributes: { Color: 'Standard' },
    };
    setVariations([...variations, newVariation]);
  };

  const handleRemoveVariation = (index: number) => {
    if (variations.length <= 1) {
      setErrorMsg('A product must have at least one variation.');
      return;
    }
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }
    if (formData.basePriceRetail <= 0 || formData.basePriceWholesale <= 0) {
      setErrorMsg('Prices must be greater than zero.');
      return;
    }

    const updated: Product = {
      ...formData,
      variations,
    };

    updateProduct(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-blue-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white">
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-sm font-bold text-white">Super Admin: Edit Product & Specs</h2>
              <p className="text-xs text-blue-100 font-mono">Verified Admin: ekenehq@gmail.com</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">Product Title</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">Brand Name</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">Wholesale MOQ (Units)</label>
              <input
                type="number"
                min="1"
                value={formData.wholesaleMinQuantity}
                onChange={(e) => setFormData({ ...formData, wholesaleMinQuantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl font-mono focus:outline-none focus:border-blue-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">Brief Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 font-mono uppercase">Full Technical Narrative</label>
            <textarea
              rows={3}
              value={formData.fullDetails}
              onChange={(e) => setFormData({ ...formData, fullDetails: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800 resize-none"
              required
            />
          </div>

          {/* Variations Section */}
          <div className="space-y-3 pt-3 border-t border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                  Product Variations & Inventory Units
                </h3>
                <p className="text-[11px] text-slate-500">Configure stock, SKUs, and variant price differentials</p>
              </div>
              <button
                type="button"
                onClick={handleAddVariation}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {variations.map((v, idx) => (
                <div key={v.id} className="p-3.5 bg-blue-50/40 border border-blue-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono text-blue-950">Variation #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(idx)}
                      className="text-slate-400 hover:text-blue-800 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono">Variant Name</label>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono">SKU Code</label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-200 rounded-lg font-mono focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono">Available Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-200 rounded-lg font-mono focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-800 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
