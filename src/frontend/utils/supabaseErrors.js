const PAUSE_ERROR_PATTERNS = [
  'paused',
  'project is paused',
  'project has been paused',
  'temporarily unavailable'
];

const NETWORK_ERROR_PATTERNS = [
  'failed to fetch',
  'fetch failed',
  'networkerror',
  'load failed',
  'timeout',
  'econnrefused',
  'enotfound'
];

const getErrorText = (error) => {
  if (!error) return '';

  return [
    error.message,
    error.details,
    error.hint,
    error.code,
    error.name,
    typeof error === 'string' ? error : ''
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

export const isSupabaseNotFoundError = (error) => {
  return error?.code === 'PGRST116';
};

export const isSupabasePauseLikeError = (error) => {
  const status = Number(error?.status || 0);
  const errorText = getErrorText(error);

  return (
    PAUSE_ERROR_PATTERNS.some((pattern) => errorText.includes(pattern)) ||
    NETWORK_ERROR_PATTERNS.some((pattern) => errorText.includes(pattern)) ||
    status === 0 ||
    status === 521 ||
    status === 522 ||
    status === 503 ||
    status === 504
  );
};

export const getSupabaseDataErrorState = (error, resourceName = 'ข้อมูล') => {
  if (isSupabasePauseLikeError(error)) {
    return {
      badge: 'Supabase paused',
      title: 'ระบบสินค้าเชื่อมต่อฐานข้อมูลไม่ได้ชั่วคราว',
      message: `Supabase อาจถูก pause หรือกำลังกลับมาออนไลน์ ทำให้ยังโหลด${resourceName}ไม่ได้ตอนนี้ กด retry หลังจาก resume โปรเจกต์แล้ว`,
      retryLabel: 'Retry'
    };
  }

  return {
    badge: 'Connection issue',
    title: `โหลด${resourceName}ไม่สำเร็จ`,
    message: 'ระบบดึงข้อมูลจากฐานข้อมูลไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง',
    retryLabel: 'ลองโหลดใหม่'
  };
};
