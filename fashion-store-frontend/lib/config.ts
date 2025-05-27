// Central configuration file for the application

// API URL - change this to match your backend server
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Authentication
export const JWT_LOCAL_STORAGE_KEY = "fashion_store_token"
export const USER_ID_LOCAL_STORAGE_KEY = "fashion_store_user_id"
export const USER_ROLE_LOCAL_STORAGE_KEY = "fashion_store_user_role"

// Roles
export const ROLE_CUSTOMER = "khach_hang"
export const ROLE_STORE = "cua_hang"

// Order statuses
export const ORDER_STATUS = {
  PENDING: "cho_duyet",
  PROCESSING: "dang_xu_ly",
  COMPLETED: "hoan_thanh",
  CANCELLED: "da_huy",
}

// Product categories
export const PRODUCT_CATEGORIES = [
  { value: "ao", label: "Áo" },
  { value: "quan", label: "Quần" },
  { value: "vay", label: "Váy" },
  { value: "dam", label: "Đầm" },
  { value: "giay", label: "Giày" },
  { value: "phu_kien", label: "Phụ kiện" },
]

// Product sizes
export const PRODUCT_SIZES = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
]

