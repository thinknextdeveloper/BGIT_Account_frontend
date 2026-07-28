"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { fetchMenu } from "@/store/slices/menuSlice";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.menu);

  useEffect(() => {
    dispatch(fetchMenu());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("userid");
    localStorage.removeItem("role");
    router.replace("/");
  };

  return (
    <aside className="w-64 h-full bg-slate-800 text-white flex flex-col shrink-0 no-print">
      <div className="flex-1 overflow-y-auto p-3">
        {loading && <p className="text-sm text-slate-400 px-3">Loading menu...</p>}

        {items.map((menu) => (
          <div key={menu.id} className="mb-2">
            <button
              onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
              className="w-full text-left px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 font-semibold"
            >
              {menu.text}
            </button>

            {openMenu === menu.id && (
              <div className="ml-4 mt-2 space-y-1">
                {menu.children.map((item) => (
                  <Link
                    key={item.id}
                   href={`/dashboard/${item.name
  .trim()
  .replace(/\s+/g, "-")}`}
                    className={`block rounded px-3 py-2 transition ${
                      pathname === `/dashboard/${item.func}`
                        ? "bg-blue-600"
                        : "hover:bg-slate-700"
                    }`}
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700 p-4 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full rounded-md bg-red-600 py-2 font-semibold hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}