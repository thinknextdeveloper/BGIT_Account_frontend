import CryptoJS from "crypto-js";

const SECRET_KEY = "SmartCampus@2025";

export const encryptData = (value: string) => {
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

export const decryptData = (value: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(value, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const setStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, encryptData(value));
  }
};

export const getStorage = (key: string) => {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(key);

  if (!value) return null;

  return decryptData(value);
};

export const removeStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};