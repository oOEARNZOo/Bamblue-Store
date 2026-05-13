"use client";
import React from 'react';

// 🎯 Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Product Image Skeleton */}
      <div className="relative">
        <div className="w-full h-64 bg-gray-200 skeleton-shimmer rounded-t-lg"></div>
        <div className="absolute top-2 right-2 w-8 h-8 bg-gray-200 skeleton-shimmer rounded-full"></div>
      </div>
      
      {/* Product Info Skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 skeleton-shimmer rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 skeleton-shimmer rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 skeleton-shimmer rounded w-1/3"></div>
      </div>
      
      {/* Button Skeleton */}
      <div className="px-4 pb-4">
        <div className="h-10 bg-gray-200 skeleton-shimmer rounded-lg"></div>
      </div>
    </div>
  );
}

// 🎯 Product Grid Skeleton (สำหรับหน้าสินค้า)
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// 🎯 Category Filter Skeleton
export function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {['all', 'clothing', 'accessories', 'shoes', 'bags'].map((category) => (
        <div key={category} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
      ))}
    </div>
  );
}

// 🎯 Hero Banner Skeleton
export function HeroBannerSkeleton() {
  return (
    <div className="relative h-96 bg-gray-200 animate-pulse rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-200"></div>
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
        <div className="h-12 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-8"></div>
        <div className="h-12 bg-gray-300 rounded w-48"></div>
      </div>
    </div>
  );
}

// 🎯 Cart Item Skeleton
export function CartItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100 animate-pulse">
      <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// 🎯 Cart Skeleton (สำหรับหน้าตะกร้า)
export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <CartItemSkeleton key={index} />
      ))}
    </div>
  );
}

// 🎯 Order Card Skeleton
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-200 rounded w-28"></div>
      </div>
    </div>
  );
}

// 🎯 Order List Skeleton
export function OrderListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </div>
  );
}

// 🎯 Review Card Skeleton
export function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}

// 🎯 Review List Skeleton
export function ReviewListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <ReviewCardSkeleton key={index} />
      ))}
    </div>
  );
}

// 🎯 Admin Stats Card Skeleton
export function AdminStatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 skeleton-shimmer rounded w-20"></div>
          <div className="h-8 bg-gray-200 skeleton-shimmer rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 skeleton-shimmer rounded-lg"></div>
      </div>
    </div>
  );
}

// 🎯 Admin Dashboard Skeleton
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminStatsCardSkeleton key={index} />
        ))}
      </div>
      
      {/* Recent Orders & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border animate-pulse">
          <div className="p-6 border-b">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border animate-pulse">
          <div className="p-6 border-b">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎯 Loading Spinner (สำหรับหน้าที่โหลดนาน)
export function LoadingSpinner({ size = 'md', text = 'กำลังโหลด...' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-[#dc6fd6] ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}

// 🎯 Page Loading Skeleton (สำหรับหน้าทั้งหน้า)
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        <div className="h-16 bg-white border-b"></div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
