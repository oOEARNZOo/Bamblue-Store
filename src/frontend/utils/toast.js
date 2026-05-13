import toast from 'react-hot-toast';

const MAX_TOASTS = 3;
let activeToasts = [];

const cleanToastQueue = (toastId) => {
  activeToasts = activeToasts.filter((id) => id !== toastId);
  activeToasts.push(toastId);

  if (activeToasts.length > MAX_TOASTS) {
    const oldestToast = activeToasts.shift();
    toast.dismiss(oldestToast);
  }
};

const baseOptions = {
  duration: 2200,
  removeDelay: 220,
};

export const limitedToast = {
  success: (message, options = {}) => {
    const id = toast.success(message, { ...baseOptions, ...options });
    cleanToastQueue(id);
    return id;
  },

  error: (message, options = {}) => {
    const id = toast.error(message, { ...baseOptions, duration: 2600, ...options });
    cleanToastQueue(id);
    return id;
  },

  default: (message, options = {}) => {
    const id = toast(message, { ...baseOptions, ...options });
    cleanToastQueue(id);
    return id;
  },

  dismissAll: () => {
    toast.dismiss();
    activeToasts = [];
  },
};

const formatItemName = (name) => (name ? `${name} ` : '');

export const shopToast = {
  cartAdded: ({ name, size, quantity = 1, totalQuantity = quantity, wasInCart = false } = {}) => {
    const itemName = formatItemName(name);
    const sizeText = size ? `ไซส์ ${size}` : 'สินค้า';
    const addText = quantity > 1 ? `เพิ่ม ${quantity} ชิ้น` : 'เพิ่ม 1 ชิ้น';
    const totalText = totalQuantity > quantity || wasInCart
      ? `รวมในตะกร้า ${totalQuantity} ชิ้น`
      : 'เพิ่มลงตะกร้าแล้ว';

    return limitedToast.success(`${itemName}${sizeText} • ${addText} • ${totalText}`, {
      id: `cart-added-${name || 'item'}-${size || 'default'}`,
      duration: 2400,
    });
  },

  cartRemoved: ({ name } = {}) => {
    const itemName = formatItemName(name);
    return limitedToast.default(`${itemName}ลบออกจากตะกร้าแล้ว`, {
      id: `cart-removed-${name || 'item'}`,
      duration: 1800,
    });
  },

  wishlistAdded: ({ name } = {}) => {
    const itemName = formatItemName(name);
    return limitedToast.success(`${itemName}เพิ่มลง Wishlist แล้ว`, {
      id: `wishlist-added-${name || 'item'}`,
      duration: 2100,
    });
  },

  wishlistExists: () => limitedToast.default('อยู่ใน Wishlist แล้ว', {
    id: 'wishlist-exists',
    duration: 1700,
  }),

  wishlistRemoved: ({ name } = {}) => {
    const itemName = formatItemName(name);
    return limitedToast.default(`${itemName}ลบออกจาก Wishlist แล้ว`, {
      id: `wishlist-removed-${name || 'item'}`,
      duration: 1800,
    });
  },

  stockOut: (size) => limitedToast.error(`ไซส์ ${size} หมดแล้ว`, {
    id: `stock-out-${size}`,
    duration: 2600,
  }),

  stockLimit: (size, stockLimit) => limitedToast.error(`ไซส์ ${size} เหลือ ${stockLimit} ชิ้น`, {
    id: `stock-limit-${size}`,
    duration: 2600,
  }),

  loginRequired: () => limitedToast.error('กรุณาเข้าสู่ระบบก่อน', {
    id: 'login-required',
    duration: 2400,
  }),
};

export default limitedToast;
