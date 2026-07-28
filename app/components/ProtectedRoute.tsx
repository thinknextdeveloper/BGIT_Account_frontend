"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.replace("/");
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace("/unauthorized");
      return;
    }

    setChecked(true);
  }, [router, allowedRoles]);

  if (!checked) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}