/**
 * ฟังก์ชันตรวจสอบ validation ของฟอร์ม checkout
 * @param {Object} formData - ข้อมูลฟอร์ม
 * @returns {Object} - { isValid: boolean, errors: {...} }
 */
export function validateCheckoutForm(formData) {
  const errors = {};

  // 1. ตรวจสอบ Email
  if (!formData.email || !formData.email.trim()) {
    errors.email = 'กรุณากรอก email';
  } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'email ไม่ถูกต้อง';
  }

  // 2. ตรวจสอบชื่อจริง
  if (!formData.firstName || !formData.firstName.trim()) {
    errors.firstName = 'กรุณากรอกชื่อจริง';
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'ชื่อจริงต้องมากกว่า 1 ตัวอักษร';
  }

  // 3. ตรวจสอบนามสกุล (ไม่บังคับ แต่ถ้าใส่ต้องกรอก)
  if (formData.lastName && formData.lastName.length > 0) {
    if (formData.lastName.trim().length < 2) {
      errors.lastName = 'นามสกุลต้องมากกว่า 1 ตัวอักษร';
    }
  }

  // 4. ตรวจสอบที่อยู่
  if (!formData.address || !formData.address.trim()) {
    errors.address = 'กรุณากรอกที่อยู่';
  } else if (formData.address.trim().length < 10) {
    errors.address = 'ที่อยู่ต้องมีความยาวอย่างน้อย 10 ตัวอักษร';
  }

  // 5. ตรวจสอบจังหวัด
  if (!formData.province || !formData.province.trim()) {
    errors.province = 'กรุณาเลือกจังหวัด';
  }

  // 6. ตรวจสอบรหัสไปรษณีย์
  if (!formData.zipcode || !formData.zipcode.trim()) {
    errors.zipcode = 'กรุณากรอกรหัสไปรษณีย์';
  } else if (!formData.zipcode.match(/^\d{5}$/)) {
    errors.zipcode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
  }

  // 7. ตรวจสอบเบอร์โทรศัพท์
  if (!formData.phone || !formData.phone.trim()) {
    errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
  } else if (!formData.phone.match(/^0\d{9}$/)) {
    errors.phone = 'เบอร์โทรต้องเป็น 0 นำหน้า และมี 10 หลัก';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * สร้างข้อความแสดงข้อผิดพลาดทั้งหมด
 * @param {Object} errors - object errors จาก validation
 * @returns {string} - ข้อความแสดงข้อผิดพลาด
 */
export function getErrorMessage(errors) {
  const errorMessages = Object.values(errors).filter(msg => msg);
  if (errorMessages.length === 0) return '';
  
  return 'ข้อผิดพลาด:\n' + errorMessages.map(msg => '• ' + msg).join('\n');
}
