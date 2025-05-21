import { JWT_LOCAL_STORAGE_KEY, USER_ID_LOCAL_STORAGE_KEY, USER_ROLE_LOCAL_STORAGE_KEY } from "./config"

// Check if code is running in browser
const isBrowser = typeof window !== "undefined"

// Save auth data to localStorage
export const saveAuthData = (token: string, userId: number, userRole: string) => {
  if (!isBrowser) return

  localStorage.setItem(JWT_LOCAL_STORAGE_KEY, token)
  localStorage.setItem(USER_ID_LOCAL_STORAGE_KEY, userId.toString())
  localStorage.setItem(USER_ROLE_LOCAL_STORAGE_KEY, userRole)
}

// Get auth data from localStorage
export const getAuthData = () => {
  if (!isBrowser) return { token: null, userId: null, userRole: null }

  const token = localStorage.getItem(JWT_LOCAL_STORAGE_KEY)
  const userId = localStorage.getItem(USER_ID_LOCAL_STORAGE_KEY)
  const userRole = localStorage.getItem(USER_ROLE_LOCAL_STORAGE_KEY)

  return {
    token,
    userId: userId ? Number.parseInt(userId) : null,
    userRole,
  }
}

// Clear auth data from localStorage
export const clearAuthData = () => {
  if (!isBrowser) return

  localStorage.removeItem(JWT_LOCAL_STORAGE_KEY)
  localStorage.removeItem(USER_ID_LOCAL_STORAGE_KEY)
  localStorage.removeItem(USER_ROLE_LOCAL_STORAGE_KEY)
}

// Check if user is authenticated
export const isAuthenticated = () => {
  if (!isBrowser) return false

  const token = localStorage.getItem(JWT_LOCAL_STORAGE_KEY)
  return !!token
}

// Parse JWT token to get payload
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing JWT token:", error)
    return null
  }
}
