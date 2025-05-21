// API functions to interact with the backend

// Auth
export const register = async (ten_dang_nhap: string, email: string, mat_khau: string, vai_tro: string) => {
  const response = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ten_dang_nhap,
      email,
      mat_khau,
      vai_tro,
    }),
  })

  if (!response.ok) {
    throw new Error("Registration failed")
  }

  return await response.json()
}

export const login = async (ten_dang_nhap: string, mat_khau: string) => {
  const response = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ten_dang_nhap,
      mat_khau,
    }),
  })

  if (!response.ok) {
    throw new Error("Login failed")
  }

  return await response.json()
}

// Store
export const fetchStoreByUserId = async (userId: number) => {
  const response = await fetch(`http://localhost:3000/api/user/${userId}/store`)

  if (!response.ok) {
    throw new Error("Failed to fetch store")
  }

  return await response.json()
}

// Products
export const fetchProducts = async (storeId: number) => {
  const response = await fetch(`http://localhost:3000/api/store/${storeId}/products`)

  if (!response.ok) {
    throw new Error("Failed to fetch products")
  }

  return await response.json()
}

export const fetchStoreProducts = async (storeId: number) => {
  const response = await fetch(`http://localhost:3000/api/store/${storeId}/products`)

  if (!response.ok) {
    throw new Error("Failed to fetch store products")
  }

  return await response.json()
}

export const fetchProduct = async (productId: number) => {
  const response = await fetch(`http://localhost:3000/api/product/${productId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch product")
  }

  return await response.json()
}

export const createProduct = async (productData: any) => {
  const response = await fetch("http://localhost:3000/api/product", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })

  if (!response.ok) {
    throw new Error("Failed to create product")
  }

  return await response.json()
}

export const updateProduct = async (productId: number, productData: any) => {
  const response = await fetch(`http://localhost:3000/api/product/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })

  if (!response.ok) {
    throw new Error("Failed to update product")
  }

  return true
}

export const deleteProduct = async (productId: number) => {
  const response = await fetch(`http://localhost:3000/api/product/${productId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete product")
  }

  return true
}

// Inventory
export const fetchProductInventory = async (productId: number) => {
  const response = await fetch(`http://localhost:3000/api/product/${productId}/inventory`)

  if (!response.ok) {
    throw new Error("Failed to fetch inventory")
  }

  return await response.json()
}

export const addProductInventory = async (productId: number, kich_co: string, so_luong: number) => {
  const response = await fetch(`http://localhost:3000/api/product/${productId}/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kich_co,
      so_luong,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to add inventory")
  }

  return await response.json()
}

export const updateInventory = async (inventoryId: number, so_luong: number) => {
  const response = await fetch(`http://localhost:3000/api/inventory/${inventoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      so_luong,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to update inventory")
  }

  return true
}

// Orders
export const createOrder = async (orderData: any) => {
  const response = await fetch("http://localhost:3000/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    throw new Error("Failed to create order")
  }

  return await response.json()
}

export const fetchUserOrders = async (userId: number) => {
  const response = await fetch(`http://localhost:3000/api/user/${userId}/orders`)

  if (!response.ok) {
    throw new Error("Failed to fetch orders")
  }

  return await response.json()
}

export const fetchOrder = async (orderId: number) => {
  const response = await fetch(`http://localhost:3000/api/order/${orderId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch order")
  }

  return await response.json()
}

export const updateOrderStatus = async (orderId: number, trang_thai: string) => {
  const response = await fetch(`http://localhost:3000/api/order/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      trang_thai,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to update order status")
  }

  return true
}
