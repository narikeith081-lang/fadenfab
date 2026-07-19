"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile?tab=orders");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-slate-200 border-t-[#0D4A86] rounded-full animate-spin" />
    </div>
  );
}
