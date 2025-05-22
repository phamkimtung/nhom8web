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

  const storeData = await response.json()

  // Lưu storeId vào localStorage để sử dụng ở các trang khác
  if (storeData && storeData.length > 0) {
    localStorage.setItem("storeId", storeData[0].id)
  }

  return storeData
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

// Cập nhật hàm updateOrderStatus để sử dụng API mới
export const updateOrderStatus = async (orderId: number, newStatus: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/order/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trang_thai: newStatus,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update order status")
    }

    return true
  } catch (error) {
    console.error("Failed to update order status:", error)
    throw new Error("Failed to update order status")
  }
}

// Lấy danh sách đơn hàng của cửa hàng
// Cập nhật hàm fetchStoreOrders để sử dụng API mới
export const fetchStoreOrders = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/orders`)

    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }

    const ordersData = await response.json()

    // Chuyển đổi dữ liệu nếu cần
    return ordersData.map((order: any) => ({
      id: order.id,
      nguoi_dung_id: order.nguoi_dung_id,
      trang_thai: order.trang_thai,
      tong_tien: order.tong_tien,
      ngay_dat: order.ngay_dat,
    }))
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    throw new Error("Failed to fetch orders")
  }
}

// Lấy danh sách khách hàng của cửa hàng
export const fetchStoreCustomers = async (storeId: number) => {
  const response = await fetch(`http://localhost:3000/api/store/${storeId}/customers`)

  if (!response.ok) {
    throw new Error("Failed to fetch store customers")
  }

  return await response.json()
}

// Lấy số lượng khách hàng của cửa hàng
export const fetchStoreCustomerCount = async (storeId: number) => {
  const response = await fetch(`http://localhost:3000/api/store/${storeId}/customer-count`)

  if (!response.ok) {
    throw new Error("Failed to fetch customer count")
  }

  return await response.json()
}

// Lấy danh sách đơn hàng của một khách hàng cụ thể
export const fetchCustomerOrders = async (storeId: number, customerId: number) => {
  const response = await fetch(`http://localhost:3000/api/store/${storeId}/customer/${customerId}/orders`)

  if (!response.ok) {
    throw new Error("Failed to fetch customer orders")
  }

  return await response.json()
}

// Añadir la nueva función para obtener el resumen de pedidos de los clientes
export const fetchCustomersOrdersSummary = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/customers/orders-summary`)

    if (!response.ok) {
      throw new Error("Failed to fetch customers orders summary")
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch customers orders summary:", error)
    throw new Error("Failed to fetch customers orders summary")
  }
}

// Función para subir una imagen
export const uploadImage = async (imageFile: File) => {
  const formData = new FormData()
  formData.append("image", imageFile)

  const response = await fetch("http://localhost:3000/api/images/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload image")
  }

  return await response.json()
}
