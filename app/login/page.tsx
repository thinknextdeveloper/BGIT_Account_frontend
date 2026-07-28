"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { loginUser } from "@/store/slices/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);


    useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    level: "Admin",
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear that field's error as soon as the user types something
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = { name: "", password: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    

    if (!validate()) return;

    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      router.push("/dashboard");
    }
  };

  const handleExit = () => {
    window.close();
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(180deg, #dceaf7 0%, #bcd6ee 40%, #a9c9e6 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white/40 border border-white rounded-md p-8 shadow-sm"
        >
          <div className="space-y-5">
            {/* Name */}
            <div>
              <div className="flex items-center gap-4">
                <label className="w-24 shrink-0 text-sm font-bold text-slate-900">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`flex-1 border rounded-sm px-2 py-1.5 bg-white text-black placeholder:text-gray-500 outline-none focus:border-blue-600 ${
                    fieldErrors.name ? "border-red-600" : "border-slate-400"
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-700 text-xs font-semibold mt-1 ml-28">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center gap-4">
                <label className="w-24 shrink-0 text-sm font-bold text-slate-900">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`flex-1 border rounded-sm px-2 py-1.5 bg-white text-black placeholder:text-gray-500 outline-none focus:border-blue-600 ${
                    fieldErrors.password ? "border-red-600" : "border-slate-400"
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-700 text-xs font-semibold mt-1 ml-28">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Level */}
            <div className="flex items-center gap-4">
              <label className="w-24 shrink-0 text-sm font-bold text-slate-900">
                Level
              </label>
              <select
                name="level"
                required
                value={formData.level}
                onChange={handleChange}
                className="flex-1 border border-slate-400 rounded-sm px-2 py-1.5 text-black bg-slate-100 outline-none focus:border-blue-600"
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="Student">Student</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-700 text-sm font-semibold mt-4 text-center">
              {error}
            </p>
          )}
        </form>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={handleSubmit}
            type="button"
            disabled={loading}
            className="w-32 py-2 rounded-sm font-bold text-blue-900 border border-blue-400 disabled:opacity-60"
            style={{
              background: "linear-gradient(180deg, #cfe2f5 0%, #9cc3e8 100%)",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
            onClick={handleExit}
            type="button"
            className="w-32 py-2 rounded-sm font-bold text-blue-900 border border-blue-400"
            style={{
              background: "linear-gradient(180deg, #cfe2f5 0%, #9cc3e8 100%)",
            }}
          >
            EXIT
          </button>
        </div>
      </div>
    </main>
  );
}