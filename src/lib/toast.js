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

export default limitedToast;
