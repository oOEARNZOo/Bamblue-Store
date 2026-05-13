"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ImagePlus,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/frontend/services/supabaseClient";
import { ProductGridSkeleton } from "@/frontend/components/LoadingSkeletons";

const SIZE_KEYS = ["S", "M", "L", "XL"];
const PAGE_SIZE = 10;

const CATEGORY_OPTIONS = [
  { value: "shirt", label: "เสื้อ" },
  { value: "dress", label: "เดรส" },
  { value: "set", label: "เซ็ต" },
];

const CATEGORY_FILTERS = [
  { value: "all", label: "หมวดหมู่ทั้งหมด" },
  ...CATEGORY_OPTIONS,
];

const STOCK_FILTERS = [
  { value: "all", label: "สถานะสต็อก" },
  { value: "ready", label: "พร้อมขาย" },
  { value: "low", label: "ใกล้หมด" },
  { value: "out", label: "หมดสต็อก" },
  { value: "sale", label: "จัดโปร" },
];

const EMPTY_FORM = {
  nameEN: "",
  nameTH: "",
  category: "shirt",
  price: "",
  original_price: "",
  discount_percent: 0,
  is_new: false,
  image: "",
  images: [],
  size_stock: { S: 0, M: 0, L: 0, XL: 0 },
};

function normalizeSizeStock(sizeStock) {
  return {
    S: Math.max(0, Number(sizeStock?.S || 0)),
    M: Math.max(0, Number(sizeStock?.M || 0)),
    L: Math.max(0, Number(sizeStock?.L || 0)),
    XL: Math.max(0, Number(sizeStock?.XL || 0)),
  };
}

function getTotalStock(productOrForm) {
  const sizeStock = normalizeSizeStock(productOrForm?.size_stock);
  const sizeTotal = SIZE_KEYS.reduce((sum, size) => sum + sizeStock[size], 0);
  return sizeTotal > 0 ? sizeTotal : Math.max(0, Number(productOrForm?.stock || 0));
}

function getCategoryLabel(value) {
  return CATEGORY_OPTIONS.find((category) => category.value === value)?.label || value || "-";
}

function getDisplayImages(product) {
  if (Array.isArray(product?.images) && product.images.length) return product.images;
  return product?.image ? [product.image] : [];
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("th-TH");
}

function mapProductToForm(product) {
  const images = getDisplayImages(product);

  return {
    nameEN: product?.nameEN || "",
    nameTH: product?.nameTH || "",
    category: product?.category || "shirt",
    price: product?.price ?? "",
    original_price: product?.original_price || product?.price || "",
    discount_percent: Number(product?.discount_percent || 0),
    is_new: Boolean(product?.is_new),
    image: images[0] || product?.image || "",
    images,
    size_stock: normalizeSizeStock(product?.size_stock),
  };
}

function MetricCard({ icon: Icon, label, value, tone }) {
  const tones = {
    pink: "from-[#dc6fd6] to-[#f05cab]",
    green: "from-emerald-400 to-teal-500",
    amber: "from-amber-400 to-orange-500",
    red: "from-rose-400 to-red-500",
  };

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-sm`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="text-xs font-medium text-slate-500">รายการ</p>
        </div>
      </div>
    </article>
  );
}

function StockMeter({ value, max }) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-[#dc6fd6]" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [panelMode, setPanelMode] = useState("edit");
  const [activePanelTab, setActivePanelTab] = useState("info");
  const [formData, setFormData] = useState({ ...EMPTY_FORM, size_stock: { ...EMPTY_FORM.size_stock } });
  const [newImageUrl, setNewImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct && products.length > 0) {
      const firstProduct = products[0];
      setSelectedProduct(firstProduct);
      setFormData(mapProductToForm(firstProduct));
      setPanelMode("edit");
    }
  }, [products, selectedProduct]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products1")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(`โหลดสินค้าไม่สำเร็จ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = products.length;
    const ready = products.filter((product) => getTotalStock(product) > 0).length;
    const low = products.filter((product) => {
      const stock = getTotalStock(product);
      return stock > 0 && stock <= 10;
    }).length;
    const sale = products.filter((product) => Number(product.discount_percent || 0) > 0).length;

    return { total, ready, low, sale };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const totalStock = getTotalStock(product);
      const discount = Number(product.discount_percent || 0);
      const matchesSearch =
        !term ||
        product.nameEN?.toLowerCase().includes(term) ||
        product.nameTH?.toLowerCase().includes(term) ||
        String(product.id).includes(term);
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "ready" && totalStock > 0) ||
        (stockFilter === "low" && totalStock > 0 && totalStock <= 10) ||
        (stockFilter === "out" && totalStock === 0) ||
        (stockFilter === "sale" && discount > 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const formTotalStock = getTotalStock(formData);
  const maxStockForBars = Math.max(
    1,
    ...products.flatMap((product) => Object.values(normalizeSizeStock(product.size_stock)))
  );

  const openCreatePanel = () => {
    setPanelMode("create");
    setSelectedProduct(null);
    setFormData({ ...EMPTY_FORM, size_stock: { ...EMPTY_FORM.size_stock }, images: [] });
    setNewImageUrl("");
    setActivePanelTab("info");
  };

  const openEditPanel = (product) => {
    setPanelMode("edit");
    setSelectedProduct(product);
    setFormData(mapProductToForm(product));
    setNewImageUrl("");
    setActivePanelTab("info");
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStockFilter("all");
  };

  const updateSizeStock = (size, value) => {
    setFormData((current) => ({
      ...current,
      size_stock: {
        ...normalizeSizeStock(current.size_stock),
        [size]: Math.max(0, Number.parseInt(value, 10) || 0),
      },
    }));
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;

    setFormData((current) => {
      const images = [...(current.images || []), url];
      return { ...current, images, image: current.image || url };
    });
    setNewImageUrl("");
  };

  const setMainImage = (index) => {
    setFormData((current) => {
      const images = [...(current.images || [])];
      if (!images[index]) return current;
      const [selected] = images.splice(index, 1);
      return { ...current, images: [selected, ...images], image: selected };
    });
  };

  const removeImage = (index) => {
    setFormData((current) => {
      const images = (current.images || []).filter((_, imageIndex) => imageIndex !== index);
      return { ...current, images, image: images[0] || "" };
    });
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!formData.nameEN.trim() || !formData.nameTH.trim()) {
      toast.error("กรุณากรอกชื่อสินค้าให้ครบ");
      return;
    }

    if (!formData.images.length) {
      toast.error("กรุณาเพิ่มรูปสินค้าอย่างน้อย 1 รูป");
      return;
    }

    try {
      setSaving(true);
      const sizeStock = normalizeSizeStock(formData.size_stock);
      const totalStock = SIZE_KEYS.reduce((sum, size) => sum + sizeStock[size], 0);
      const price = Number.parseFloat(formData.price) || 0;
      const discountPercent = Math.max(0, Math.min(100, Number.parseInt(formData.discount_percent, 10) || 0));

      const payload = {
        nameEN: formData.nameEN.trim(),
        nameTH: formData.nameTH.trim(),
        category: formData.category,
        price,
        original_price: discountPercent > 0 ? Number.parseFloat(formData.original_price) || price : null,
        discount_percent: discountPercent,
        is_new: Boolean(formData.is_new),
        image: formData.images[0],
        images: formData.images,
        size_stock: sizeStock,
        stock: totalStock,
      };

      if (panelMode === "edit" && selectedProduct?.id) {
        const { error } = await supabase.from("products1").update(payload).eq("id", selectedProduct.id);
        if (error) throw error;
        setSelectedProduct({ ...selectedProduct, ...payload });
        toast.success("บันทึกการแก้ไขสินค้าแล้ว");
      } else {
        const { data, error } = await supabase.from("products1").insert([payload]).select("*").single();
        if (error) throw error;
        toast.success("เพิ่มสินค้าใหม่แล้ว");
        setSelectedProduct(data);
        setPanelMode("edit");
      }

      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(`บันทึกสินค้าไม่สำเร็จ: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = (product) => {
    if (!product?.id || deletingId) return;
    setDeletingId(product.id);

    toast((toastItem) => (
      <div className="space-y-4">
        <div>
          <p className="font-black text-slate-950">ยืนยันการลบสินค้า</p>
          <p className="mt-1 text-sm text-slate-600">{product.nameEN}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              toast.dismiss(toastItem.id);
              try {
                const { error } = await supabase.from("products1").delete().eq("id", product.id);
                if (error) throw error;
                toast.success("ลบสินค้าแล้ว");
                if (selectedProduct?.id === product.id) {
                  setSelectedProduct(null);
                  setFormData({ ...EMPTY_FORM, size_stock: { ...EMPTY_FORM.size_stock }, images: [] });
                }
                await fetchProducts();
              } catch (error) {
                console.error("Error deleting product:", error);
                toast.error(`ลบสินค้าไม่สำเร็จ: ${error.message}`);
              } finally {
                setDeletingId(null);
              }
            }}
            className="flex-1 rounded-xl bg-rose-500 px-4 py-2 text-sm font-black text-white hover:bg-rose-600"
          >
            ลบ
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(toastItem.id);
              setDeletingId(null);
            }}
            className="flex-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-200"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: { borderRadius: "18px", maxWidth: "360px" },
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf8fb] p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-24 rounded-3xl bg-white" />
          <ProductGridSkeleton count={8} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff5fb_0,#fbf8fb_38%,#f8fafc_100%)] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-7">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">จัดการสินค้า</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  จัดการ เพิ่ม แก้ไข และลบสินค้าในร้าน Bamblue Store
                </p>
              </div>
              <button
                type="button"
                onClick={openCreatePanel}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#dc6fd6] to-[#f05cab] px-6 text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5"
              >
                <Plus size={18} />
                เพิ่มสินค้าใหม่
              </button>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <MetricCard icon={ShoppingBag} label="สินค้าทั้งหมด" value={stats.total} tone="pink" />
              <MetricCard icon={CheckCircle2} label="สินค้าพร้อมขาย" value={stats.ready} tone="green" />
              <MetricCard icon={AlertTriangle} label="สินค้าใกล้หมด" value={stats.low} tone="amber" />
              <MetricCard icon={Tag} label="สินค้าจัดโปร" value={stats.sale} tone="red" />
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="grid gap-3 border-b border-slate-100 p-4 lg:grid-cols-[1fr_220px_220px_auto]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="ค้นหาสินค้า (ชื่อสินค้า EN/TH)"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                  />
                </label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                >
                  {CATEGORY_FILTERS.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
                <select
                  value={stockFilter}
                  onChange={(event) => setStockFilter(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                >
                  {STOCK_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:border-pink-200 hover:text-[#dc6fd6]"
                >
                  <RefreshCw size={17} />
                  ล้างตัวกรอง
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-black text-slate-500">
                      <th className="w-12 px-5 py-4">
                        <span className="block h-4 w-4 rounded border border-slate-300" />
                      </th>
                      <th className="px-4 py-4">สินค้า</th>
                      <th className="px-4 py-4">หมวดหมู่</th>
                      <th className="px-4 py-4">ราคา</th>
                      <th className="px-4 py-4">สต็อก (S / M / L / XL)</th>
                      <th className="px-4 py-4">สถานะ</th>
                      <th className="px-5 py-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageProducts.map((product) => {
                      const images = getDisplayImages(product);
                      const sizeStock = normalizeSizeStock(product.size_stock);
                      const totalStock = getTotalStock(product);
                      const discount = Number(product.discount_percent || 0);
                      const active = selectedProduct?.id === product.id;

                      return (
                        <tr key={product.id} className={`transition-colors ${active ? "bg-pink-50/50" : "hover:bg-slate-50/70"}`}>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => openEditPanel(product)}
                              className={`h-4 w-4 rounded border ${active ? "border-[#dc6fd6] bg-[#dc6fd6]" : "border-slate-300 bg-white"}`}
                              aria-label={`เลือก ${product.nameEN}`}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <button type="button" onClick={() => openEditPanel(product)} className="flex min-w-0 items-center gap-3 text-left">
                              <img
                                src={images[0] || "/Picture/icon.png"}
                                alt={product.nameEN || "Product"}
                                className="h-14 w-14 rounded-xl object-cover"
                                onError={(event) => {
                                  event.currentTarget.src = "/Picture/icon.png";
                                }}
                              />
                              <span className="min-w-0">
                                <span className="block max-w-64 truncate text-sm font-black text-slate-950">{product.nameEN}</span>
                                <span className="block max-w-64 truncate text-xs font-medium text-slate-500">{product.nameTH}</span>
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                              {getCategoryLabel(product.category)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-black text-[#dc6fd6]">฿{formatPrice(product.price)}</td>
                          <td className="px-4 py-4">
                            <div className="grid max-w-xs grid-cols-4 gap-3">
                              {SIZE_KEYS.map((size) => (
                                <div key={size} className="text-center">
                                  <p className="text-xs font-black text-slate-900">{sizeStock[size]}</p>
                                  <StockMeter value={sizeStock[size]} max={maxStockForBars} />
                                  <p className="mt-1 text-[11px] font-bold text-slate-400">{size}</p>
                                </div>
                              ))}
                            </div>
                            <p className="mt-2 text-xs font-bold text-slate-400">รวม {totalStock} ชิ้น</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {product.is_new && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">NEW</span>}
                              {discount > 0 && <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">SALE</span>}
                              {totalStock === 0 && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">หมด</span>}
                              {!product.is_new && discount === 0 && totalStock > 0 && <span className="text-sm font-bold text-slate-400">-</span>}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditPanel(product)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-[#dc6fd6] transition hover:bg-pink-100"
                                aria-label={`แก้ไข ${product.nameEN}`}
                              >
                                <Edit3 size={17} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(product)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                                aria-label={`ลบ ${product.nameEN}`}
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <Package className="mx-auto mb-4 text-slate-300" size={54} />
                  <p className="text-lg font-black text-slate-800">ไม่พบสินค้า</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">ลองเปลี่ยนคำค้นหาหรือตัวกรองอีกครั้ง</p>
                </div>
              )}

              <footer className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-500">
                  แสดง {filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} จาก {filteredProducts.length} รายการ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-35"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="rounded-xl bg-pink-50 px-4 py-2 text-sm font-black text-[#dc6fd6]">{currentPage}</span>
                  <span className="px-2 text-sm font-bold text-slate-400">/ {totalPages}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 disabled:opacity-35"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </footer>
            </section>
          </div>
        </section>

        <aside className="border-t border-slate-100 bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.06)] xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-l xl:border-t-0">
          <form onSubmit={saveProduct} className="flex min-h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  {panelMode === "create" ? "เพิ่มสินค้าใหม่" : "แก้ไขสินค้า"}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {panelMode === "create" ? "กรอกข้อมูลสินค้าใหม่" : selectedProduct?.nameEN || "เลือกสินค้าจากตาราง"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedProduct) {
                    setFormData(mapProductToForm(selectedProduct));
                    setPanelMode("edit");
                  } else {
                    openCreatePanel();
                  }
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label="รีเซ็ตฟอร์ม"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 border-b border-slate-100 px-6">
              {[
                { id: "info", label: "ข้อมูลสินค้า" },
                { id: "images", label: "รูปภาพ" },
                { id: "options", label: "ตัวเลือกอื่นๆ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePanelTab(tab.id)}
                  className={`border-b-2 px-1 py-4 text-sm font-black transition-colors ${
                    activePanelTab === tab.id
                      ? "border-[#dc6fd6] text-[#dc6fd6]"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-6 px-6 py-6">
              {activePanelTab === "info" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">ชื่อสินค้า (EN) *</label>
                    <input
                      required
                      value={formData.nameEN}
                      onChange={(event) => setFormData({ ...formData, nameEN: event.target.value })}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">ชื่อสินค้า (TH) *</label>
                    <input
                      required
                      value={formData.nameTH}
                      onChange={(event) => setFormData({ ...formData, nameTH: event.target.value })}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">หมวดหมู่ *</label>
                      <select
                        value={formData.category}
                        onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                      >
                        {CATEGORY_OPTIONS.map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700">ราคา (บาท) *</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-black text-slate-700">สต็อกแต่ละไซส์</label>
                      <span className="text-xs font-bold text-slate-500">รวม {formTotalStock} ชิ้น</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {SIZE_KEYS.map((size) => (
                        <div key={size}>
                          <label className="mb-2 block text-center text-sm font-black text-slate-600">{size}</label>
                          <input
                            type="number"
                            min="0"
                            value={normalizeSizeStock(formData.size_stock)[size]}
                            onChange={(event) => updateSizeStock(size, event.target.value)}
                            className="h-12 w-full rounded-xl border border-slate-200 px-2 text-center text-sm font-black outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activePanelTab === "images" && (
                <>
                  <div className="rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 p-4">
                    {formData.images.length ? (
                      <div className="grid grid-cols-2 gap-3">
                        {formData.images.map((image, index) => (
                          <div key={`${image}-${index}`} className="group relative overflow-hidden rounded-xl bg-white">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="h-32 w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.src = "/Picture/icon.png";
                              }}
                            />
                            {index === 0 && (
                              <span className="absolute left-2 top-2 rounded-full bg-[#dc6fd6] px-2 py-1 text-[10px] font-black text-white">หลัก</span>
                            )}
                            <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => setMainImage(index)}
                                  className="flex-1 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-black text-slate-700"
                                >
                                  ตั้งหลัก
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="rounded-lg bg-rose-500 px-2 py-1 text-[11px] font-black text-white"
                              >
                                ลบ
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-44 flex-col items-center justify-center rounded-xl bg-white text-center">
                        <ImagePlus className="mb-3 text-pink-300" size={38} />
                        <p className="text-sm font-black text-slate-600">ยังไม่มีรูปสินค้า</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(event) => setNewImageUrl(event.target.value)}
                      placeholder="วาง URL รูปภาพ"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-700"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </>
              )}

              {activePanelTab === "options" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">ส่วนลด (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(event) => setFormData({ ...formData, discount_percent: event.target.value })}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">ราคาเดิม</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.original_price}
                      onChange={(event) => setFormData({ ...formData, original_price: event.target.value })}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-[#dc6fd6] focus:ring-4 focus:ring-pink-100"
                    />
                  </div>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discount_percent: Number(formData.discount_percent || 0) > 0 ? 0 : 10 })}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm"
                    >
                      <span>
                        <span className="block text-sm font-black text-slate-800">สินค้าจัดโปรโมชั่น</span>
                        <span className="text-xs font-medium text-slate-500">เปิดจากค่า discount_percent</span>
                      </span>
                      <span className={`h-7 w-12 rounded-full p-1 transition ${Number(formData.discount_percent || 0) > 0 ? "bg-[#dc6fd6]" : "bg-slate-200"}`}>
                        <span className={`block h-5 w-5 rounded-full bg-white transition ${Number(formData.discount_percent || 0) > 0 ? "translate-x-5" : ""}`} />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_new: !formData.is_new })}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 text-left shadow-sm"
                    >
                      <span>
                        <span className="block text-sm font-black text-slate-800">สินค้าใหม่ (NEW)</span>
                        <span className="text-xs font-medium text-slate-500">แสดง badge NEW หน้าร้าน</span>
                      </span>
                      <span className={`h-7 w-12 rounded-full p-1 transition ${formData.is_new ? "bg-[#dc6fd6]" : "bg-slate-200"}`}>
                        <span className={`block h-5 w-5 rounded-full bg-white transition ${formData.is_new ? "translate-x-5" : ""}`} />
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-slate-100 p-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => selectedProduct ? openEditPanel(selectedProduct) : openCreatePanel()}
                  className="h-12 flex-1 rounded-xl border border-slate-200 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-12 flex-[1.8] rounded-xl bg-gradient-to-r from-[#dc6fd6] to-[#f05cab] text-sm font-black text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </div>
          </form>
        </aside>
      </div>
    </main>
  );
}
