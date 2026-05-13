"use client";

import { usePathname } from 'next/navigation';
import { PageMotion } from '@/frontend/components/motion/MotionPrimitives';

export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <PageMotion key={pathname} className="page-transition">
      {children}
    </PageMotion>
  );
}
