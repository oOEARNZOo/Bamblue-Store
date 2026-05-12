import toast from 'react-hot-toast';

// จำกัดจำนวน toast ที่แสดงพร้อมกันสูงสุด 3 อัน
const MAX_TOASTS = 3;
let activeToasts = [];

// ฟังก์ชันจัดการ toast queue
const manageToastQueue = (newToastId) => {
  activeToasts.push(newToastId);
  
  // ถ้าเกิน 3 อัน ให้ลบอันเก่าสุดออก
  if (activeToasts.length > MAX_TOASTS) {
    const oldestToast = activeToasts.shift();
    toast.dismiss(oldestToast);
  }
};

// Custom toast functions ที่จำกัดจำนวน
export const limitedToast = {
  success: (message, options = {}) => {
    const id = toast.success(message, options);
    manageToastQueue(id);
    return id;
  },
  
  error: (message, options = {}) => {
    const id = toast.error(message, options);
    manageToastQueue(id);
    return id;
  },
  
  // Toast ปกติ
  default: (message, options = {}) => {
    const id = toast(message, options);
    manageToastQueue(id);
    return id;
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
    activeToasts = [];
  }
};

export const shopToast = {
  cartAdded: ({ name, size, quantity = 1 } = {}) => {
    const itemName = name ? `${name} ` : '';
    const quantityText = quantity > 1 ? ` x${quantity}` : '';
    return limitedToast.success(`${itemName}เพิ่มลงตะกร้าแล้ว${quantityText}`, {
      id: `cart-added-${name || 'item'}-${size || 'default'}`,
      duration: 2200
    });
  },

  cartRemoved: () => limitedToast.default('ลบออกจากตะกร้าแล้ว', {
    id: 'cart-removed',
    duration: 1800
  }),

  wishlistAdded: ({ name } = {}) => {
    const itemName = name ? `${name} ` : '';
    return limitedToast.success(`${itemName}เพิ่มลง Wishlist แล้ว`, {
      id: `wishlist-added-${name || 'item'}`,
      duration: 2200
    });
  },

  wishlistExists: () => limitedToast.default('อยู่ใน Wishlist แล้ว', {
    id: 'wishlist-exists',
    duration: 1800
  }),

  wishlistRemoved: () => limitedToast.default('ลบออกจาก Wishlist แล้ว', {
    id: 'wishlist-removed',
    duration: 1800
  }),

  stockOut: (size) => limitedToast.error(`ไซส์ ${size} หมดแล้ว`, {
    id: `stock-out-${size}`,
    duration: 2600
  }),

  stockLimit: (size, stockLimit) => limitedToast.error(`ไซส์ ${size} เหลือ ${stockLimit} ตัว`, {
    id: `stock-limit-${size}`,
    duration: 2600
  }),

  loginRequired: () => limitedToast.error('กรุณาเข้าสู่ระบบก่อน', {
    id: 'login-required',
    duration: 2400
  })
};

export default limitedToast;
