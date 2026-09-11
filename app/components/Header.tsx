"use client";

import { useEffect, useState } from "react";
import { getStorage } from "@/utils/storage";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setMounted(true);

    setUsername(getStorage("userid") || "");
    setRole(getStorage("role") || "");
  }, []);

  if (!mounted) return null;

  return (
    <header className="h-16 bg-blue-700 text-white flex justify-between items-center px-6 no-print">
      <h1 className="text-xl font-bold">
        Smart Campus Management
      </h1>

      <div className="flex items-center gap-4">
        <span>{username}</span>

        <span className="bg-blue-900 px-3 py-1 rounded">
          {role}
        </span>
      </div>
    </header>
  );
}