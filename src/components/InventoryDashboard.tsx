import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariation } from '../types';
import { formatPrice } from '../utils/currency';
import { ProductEditModal } from './ProductEditModal';
import {
  Package,
  AlertTriangle,
  Search,
  Plus,
  ArrowUpDown,
  Edit2,
  ExternalLink,
  Layers,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  X,
  Crown,
} from 'lucide-react';

export const InventoryDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    restockVariant,
    openProductDetail,
    currency,
    stockAlerts,
    resetCatalog,
    isSuperAdminUser,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const flattenedInventory = useMemo(() => {
    const list: {
      product: Product;
      variant: ProductVariation;
      totalVariantRetailValue: number;
      totalVariantWholesaleValue: number;
      isLow: boolean;
      isOut: boolean;
    }[] = [];

    products.forEach((prod) => {
      prod.variations.forEach((v) => {
        const retailPrice = prod.basePriceRetail + v.priceDeltaRetail;
        const wholesalePrice = prod.basePriceWholesale + v.priceDeltaWholesale;
        const isOut = v.stock <= 0;
        const isLow = v.stock > 0 && v.stock <= v.lowStockThreshold;

        list.push({
          product: prod,
          variant: v,
          totalVariantRetailValue: retailPrice * v.stock,
          totalVariantWholesaleValue: wholesalePrice * v.stock,
          isLow,
          isOut,
        });
      });
    });

    return list;
  }, [products]);

  const filteredList = useMemo(() => {
    return flattenedInventory.filter((item) => {
      if (filterStatus === 'low' && !item.isLow) return false;
      if (filterStatus === 'out' && !item.isOut) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.product.name.toLowerCase().includes(q);
        const matchBrand = item.product.brand.toLowerCase().includes(q);
        const matchSku = item.variant.sku.toLowerCase().includes(q);
        const matchVariant = item.variant.name.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSku && !matchVariant) return false;
      }
      return true;
    });
  }, [flattenedInventory, filterStatus, searchQuery]);

  const totalUnits = flattenedInventory.reduce((acc, curr) => acc + curr.variant.stock, 0);
  const totalWholesaleValue = flattenedInventory.reduce(
    (acc, curr) => acc + curr.totalVariantWholesaleValue,
    0
  );

  if (!isSuperAdminUser) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto bg-white border border-blue-100 rounded-3xl p-8 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Crown className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Super Admin Permissions Required</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The inventory dashboard and stock control management tools are restricted to <strong>ekenehq@gmail.com</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 p-6 rounded-3xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-100">
              Super Admin Console (ekenehq@gmail.com)
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Real-Time Hardware Stock & Multi-Variant Control
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
            Live valuation of current warehouse units, stock thresholds, and variation SKU audits.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-blue-100 p-5 rounded-3xl shadow-xs">
          <div className="text-xs text-blue-800 font-mono font-bold">Total Stock Units</div>
          <div className="mt-1.5 text-2xl font-extrabold font-mono text-blue-950 tabular-nums">
            {totalUnits.toLocaleString()} units
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Across {flattenedInventory.length} variation SKUs
          </div>
        </div>

        <div className="bg-white border border-blue-100 p-5 rounded-3xl shadow-xs">
          <div className="text-xs text-blue-800 font-mono font-bold">Total Inventory Valuation</div>
          <div className="mt-1.5 text-2xl font-extrabold font-mono text-blue-950 tabular-nums">
            {formatPrice(totalWholesaleValue, currency)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Based on wholesale tier base
          </div>
        </div>

        <div className="bg-white border border-blue-100 p-5 rounded-3xl shadow-xs">
          <div className="text-xs text-blue-800 font-mono font-bold">Active Stock Warnings</div>
          <div className="mt-1.5 text-2xl font-extrabold font-mono text-blue-800 tabular-nums">
            {stockAlerts.length}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Variations needing reorder
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white border border-blue-100 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-blue-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by SKU, variant, or product..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-blue-50/30 border border-blue-200 rounded-xl focus:outline-none focus:border-blue-800"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-blue-50 p-1 rounded-xl text-xs border border-blue-200">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'all' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600'
              }`}
            >
              All SKUs ({flattenedInventory.length})
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'low' ? 'bg-blue-800 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilterStatus('out')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'out' ? 'bg-blue-800 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-blue-50/80 border-b border-blue-100 text-blue-950 font-mono text-[11px]">
                <th className="py-3 px-4 font-bold">Hardware Product</th>
                <th className="py-3 px-3 font-bold">Variant Name</th>
                <th className="py-3 px-3 font-bold">SKU</th>
                <th className="py-3 px-3 font-bold text-center">Current Units</th>
                <th className="py-3 px-3 font-bold text-center">Safety Limit</th>
                <th className="py-3 px-4 font-bold text-right">Wholesale Value</th>
                <th className="py-3 px-4 font-bold text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100/60">
              {filteredList.map((item) => (
                <tr key={`${item.product.id}-${item.variant.id}`} className="hover:bg-blue-50/30">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.product.name}</div>
                    <div className="text-[10px] text-blue-800 font-mono">{item.product.brand}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{item.variant.name}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{item.variant.sku}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    <span
                      className={
                        item.isOut
                          ? 'text-blue-800'
                          : item.isLow
                          ? 'text-amber-600'
                          : 'text-slate-900'
                      }
                    >
                      {item.variant.stock}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    {item.variant.lowStockThreshold}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-950">
                    {formatPrice(item.totalVariantWholesaleValue, currency)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => restockVariant(item.product.id, item.variant.id, 10)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-mono text-[11px] font-bold rounded-lg border border-blue-200 cursor-pointer"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => restockVariant(item.product.id, item.variant.id, 50)}
                        className="px-2 py-1 bg-gradient-to-r from-blue-800 to-blue-900 text-white font-mono text-[11px] font-bold rounded-lg cursor-pointer shadow-xs"
                      >
                        +50
                      </button>
                      <button
                        onClick={() => setEditingProduct(item.product)}
                        className="p-1 text-slate-400 hover:text-blue-800 rounded cursor-pointer"
                        title="Edit specifications"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};
