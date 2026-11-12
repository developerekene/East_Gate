import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Search } from 'lucide-react';

export const ProductList: React.FC = () => {
  const { products } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category match
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Search match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          const matchesSKU = p.variations.some(
            (v) => v.sku.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)
          );
          if (!matchesName && !matchesBrand && !matchesDesc && !matchesSKU) {
            return false;
          }
        }

        // In-stock match
        if (onlyInStock) {
          const totalStock = p.variations.reduce((sum, v) => sum + v.stock, 0);
          if (totalStock <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.volumeTiers[0]?.priceNGN || a.basePriceRetail;
        const priceB = b.volumeTiers[0]?.priceNGN || b.basePriceRetail;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'stock') {
          const stockA = a.variations.reduce((s, v) => s + v.stock, 0);
          const stockB = b.variations.reduce((s, v) => s + v.stock, 0);
          return stockB - stockA;
        }
        return 0; // featured default
      });
  }, [products, selectedCategory, searchQuery, onlyInStock, sortBy]);

  return (
    <div className="space-y-6">
      {/* Navigation & Search Toolbar */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-700" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search smartwatches, TWS earbuds, smartphones, or electronics..."
              className="w-full pl-10 pr-14 py-2.5 bg-white border border-blue-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800/20 focus:border-blue-800 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2.5 bg-white border border-blue-200/80 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-800 cursor-pointer shadow-xs"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock">Highest Stock</option>
            </select>

            {/* Stock toggle */}
            <button
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-colors cursor-pointer border ${
                onlyInStock
                  ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs'
                  : 'bg-white text-slate-600 border-blue-200 hover:bg-blue-50'
              }`}
            >
              {onlyInStock ? '✓ In-Stock Only' : 'Show All'}
            </button>
          </div>
        </div>

        {/* Category Filter Chips (Dark Red theme) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs rounded-2xl whitespace-nowrap transition-all cursor-pointer font-semibold ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#0B2545] to-[#1E3A8A] text-white shadow-xs'
                  : 'bg-white border border-blue-200/80 text-slate-700 hover:text-[#0B2545] hover:bg-blue-50/70'
              }`}
            >
              {cat === 'all' ? 'All Collections' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Display: Responsive Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white border border-blue-100 rounded-3xl">
          <p className="text-sm font-bold text-[#0B2545]">No products found</p>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search query or collection filter.
          </p>
        </div>
      )}
    </div>
  );
};
