"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { supabasePublic } from '@/frontend/services/supabaseClient';

const NAVBAR_PRODUCTS_CACHE_KEY = 'navbar_products_cache_v2';
const NAVBAR_PRODUCTS_CACHE_TIME_KEY = 'navbar_products_cache_time_v2';
const NAVBAR_PRODUCT_COLUMNS = 'id, nameEN, nameTH, category, image, price, discount_percent';

const readJsonArrayFromStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return [];

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
};

const popularSearches = ['เสื้อ', 'เดรส', 'ชุดเซ็ต', 'Dress'];

export default function NavbarSearch({ isOpen, onClose, panelRef }) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1); // สำหรับ Keyboard Navigation

  useEffect(() => {
    const savedSearches = readJsonArrayFromStorage('recentSearches');
    setRecentSearches(savedSearches);
  }, []);

  // ดึงข้อมูลสินค้าจาก Supabase สำหรับใช้ในช่องค้นหา
  useEffect(() => {
    async function fetchProducts() {
      try {
        // ✅ ตรวจสอบ localStorage cache ก่อน (cache 1 ชั่วโมง)
        const cachedProducts = localStorage.getItem(NAVBAR_PRODUCTS_CACHE_KEY);
        const cacheTimestamp = localStorage.getItem(NAVBAR_PRODUCTS_CACHE_TIME_KEY);
        const now = Date.now();
        const CACHE_DURATION = 60 * 60 * 1000; // 1 ชั่วโมง

        if (cachedProducts && cacheTimestamp) {
          const isExpired = now - parseInt(cacheTimestamp) > CACHE_DURATION;
          if (!isExpired) {
            // ✅ ใช้ cache ที่ยังไม่หมดอายุ
            const parsedProducts = readJsonArrayFromStorage(NAVBAR_PRODUCTS_CACHE_KEY);
            if (parsedProducts.length > 0) {
              setProductsData(parsedProducts);
              return;
            }
          }
        }

        // ✅ ถ้า cache หมดอายุหรือไม่มี ให้ดึงใหม่
        const { data, error } = await supabasePublic
          .from('products1')
          .select(NAVBAR_PRODUCT_COLUMNS)
          .order('id', { ascending: false });

        if (!error && data) {
          setProductsData(data);
          // ✅ บันทึก cache ใหม่
          localStorage.setItem(NAVBAR_PRODUCTS_CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(NAVBAR_PRODUCTS_CACHE_TIME_KEY, now.toString());
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }
    fetchProducts();
  }, []);

  const saveRecentSearch = (term) => {
    const updatedSearches = [term, ...recentSearches.filter(item => item !== term)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const openSuggestion = (item) => {
    saveRecentSearch(item.nameEN);
    router.push(`/product/${item.id}`);
    onClose();
    setSearchInput('');
    setSuggestions([]);
  };

  const handleSearch = (term) => {
    if (!term.trim()) return;

    saveRecentSearch(term);

    onClose();
    setSearchInput('');
    setSuggestions([]);

    // ตรวจสอบว่าเป็นหมวดหมู่หรือไม่
    const categoryMap = {
      'เสื้อ': 'shirt',
      'shirt': 'shirt',
      'เดรส': 'dress',
      'dress': 'dress',
      'ชุดเซ็ต': 'set',
      'set': 'set'
    };

    const lowerTerm = term.toLowerCase();
    const categoryKey = Object.keys(categoryMap).find(key => key.toLowerCase() === lowerTerm);

    if (categoryKey) {
      // ถ้าเป็นหมวดหมู่ ให้ลิงค์ไปที่หมวดหมู่โดยตรง
      router.push(`/products?category=${categoryMap[categoryKey]}`);
    } else {
      // ถ้าไม่ใช่หมวดหมู่ ให้ค้นหาปกติ
      router.push(`/products?search=${encodeURIComponent(term)}`);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setSelectedIndex(-1); // รีเซ็ต index เมื่อพิมพ์ใหม่

    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      const filtered = productsData.filter(p =>
        (p.nameEN || '').toLowerCase().includes(q) ||
        (p.nameTH || '').toLowerCase().includes(q)
      ).slice(0, 5);

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // ฟังก์ชันจัดการ Keyboard Navigation
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) {
      if (e.key === 'Enter') handleSearch(searchInput);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const nextIndex = prev < suggestions.length - 1 ? prev + 1 : 0;
          if (suggestions[nextIndex]) {
            setSearchInput(suggestions[nextIndex].nameEN);
          }
          return nextIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const nextIndex = prev > 0 ? prev - 1 : suggestions.length - 1;
          if (suggestions[nextIndex]) {
            setSearchInput(suggestions[nextIndex].nameEN);
          }
          return nextIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          openSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch(searchInput);
        }
        break;
      case 'Escape':
        onClose();
        setSuggestions([]);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={panelRef} className="dropdown-animate fixed inset-x-4 top-[78px] z-[60] max-h-[calc(100vh-104px)] overflow-y-auto rounded-2xl border border-pink-100 bg-white p-4 shadow-[0_28px_80px_rgba(31,18,36,0.22)] ring-1 ring-pink-100 cursor-default md:absolute md:left-auto md:right-6 md:top-full md:mt-4 md:w-[28rem] md:max-h-[calc(100vh-120px)]">
      <div className="w-full">
        {/* 🔍 ช่องค้นหาพร้อมไอคอน */}
        <div className="relative w-full mb-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า เช่น เสื้อ, Butterfly, Dress..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm text-gray-800 shadow-inner shadow-gray-100/60 outline-none transition-colors focus:border-[#dc6fd6]"
              autoFocus
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSuggestions([]); setSelectedIndex(-1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="ล้างคำค้นหา"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* 💡 Keyboard hint */}
          {searchInput && (
            <p className="text-xs text-gray-400 mt-2">
              กด <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">↓</kbd> เพื่อเลือก, <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> เพื่อยืนยัน
            </p>
          )}

          {/* 🎯 Suggestions Dropdown */}
          {searchInput.trim().length > 0 && (
            <div className="mt-3 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-gray-100">
              {suggestions.length > 0 ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs text-gray-500">พบ {suggestions.length} รายการ</p>
                  </div>
                  {suggestions.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => openSuggestion(item)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-4 transition-colors border-b border-gray-50 last:border-none cursor-pointer ${index === selectedIndex ? 'bg-pink-50 ring-1 ring-inset ring-[#dc6fd6]/35' : 'hover:bg-gray-50'
                        }`}
                    >
                      <img src={item.image} alt={item.nameEN} className="w-14 h-18 object-cover rounded-lg bg-gray-100 shrink-0 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-800 line-clamp-1">{item.nameEN}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.nameTH}</p>
                        <p className="text-sm font-bold text-[#dc6fd6] mt-1">฿{Number(item.price).toLocaleString()}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-5 py-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">ไม่พบสินค้าที่ค้นหา</p>
                  <p className="text-sm text-gray-400">ลองค้นหาด้วยคำอื่น เช่น &ldquo;เสื้อ&rdquo; หรือ &ldquo;Dress&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-4">คำค้นหายอดนิยม</h4>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="cursor-pointer px-3.5 py-1.5 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-[#dc6fd6] hover:text-[#dc6fd6] transition-colors bg-white"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {recentSearches.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-500">สินค้าที่เพิ่งค้นหา</h4>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  ล้างประวัติ
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="cursor-pointer px-3.5 py-1.5 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-[#dc6fd6] hover:text-[#dc6fd6] transition-colors bg-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
