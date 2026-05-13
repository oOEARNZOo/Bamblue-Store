"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/frontend/components/Navbar";
import Footer from "@/frontend/components/Footer";
import PageTransition from "@/frontend/components/PageTransition";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return children;
  }

  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}
