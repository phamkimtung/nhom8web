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
export const fetchCustomerOrders = async (customerId: number) => {
  try {
    const response = await fetch(`http://localhost:3000/api/customers/${customerId}/order-history`)

    if (!response.ok) {
      throw new Error("Failed to fetch customer orders")
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch customer orders:", error)
    throw error
  }
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
// Thêm hàm này vào cuối file, trước export cuối cùng
export const fetchAllProducts = async () => {
  const response = await fetch("http://localhost:3000/api/products")

  if (!response.ok) {
    throw new Error("Failed to fetch all products")
  }

  return await response.json()
}
export const fetchOrderDetails = async (orderId: number) => {
  const response = await fetch(`http://localhost:3000/api/orders/${orderId}/details`)

  if (!response.ok) {
    throw new Error("Failed to fetch order details")
  }

  return await response.json()
}
// Thêm hàm này để lấy doanh thu
export const fetchRevenue = async () => {
  const response = await fetch("http://localhost:3000/api/orders/revenue")

  if (!response.ok) {
    throw new Error("Failed to fetch revenue")
  }

  return await response.json()
}
// // Thêm hàm này để lấy thống kê đơn hàng theo tuần
// export const fetchWeeklyOrderStats = async () => {
//   const response = await fetch("http://localhost:3000/api/orders/weekly-stats")

//   if (!response.ok) {
//     throw new Error("Failed to fetch weekly order stats")
//   }

//   return await response.json()
// }

// // Thêm hàm này để lấy thống kê theo tuần (7 tuần gần nhất)
// export const fetchWeeklySummary = async () => {
//   const response = await fetch("http://localhost:3000/api/statistics/weekly-summary")

//   if (!response.ok) {
//     throw new Error("Failed to fetch weekly summary")
//   }

//   return await response.json()
// }

// Thêm hàm này để lấy đơn hàng theo khoảng ngày
export const fetchOrdersByDateRange = async (startDate: string, endDate: string) => {
  const response = await fetch(`http://localhost:3000/api/don-hang/theo-ngay?startDate=${startDate}&endDate=${endDate}`)

  if (!response.ok) {
    throw new Error("Failed to fetch orders by date range")
  }

  return await response.json()
}
// Thêm các hàm API cho đánh giá sản phẩm
export const createProductReview = async (
  nguoi_dung_id: number,
  san_pham_id: number,
  so_sao: number,
  noi_dung?: string,
) => {
  const response = await fetch("http://localhost:3000/api/danh-gia/san-pham", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nguoi_dung_id,
      san_pham_id,
      so_sao,
      noi_dung,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create review")
  }

  return await response.json()
}

// export const fetchProductReviews = async (productId: number) => {
//   const response = await fetch(`http://localhost:3000/api/san-pham/${productId}/danh-gia`)

//   if (!response.ok) {
//     throw new Error("Failed to fetch product reviews")
//   }

//   return await response.json()
// }
// ===== THÊM CÁC API CHO ĐÁNH GIÁ =====

// Tạo đánh giá mới
export const createReview = async (reviewData: {
  nguoi_dung_id: number
  san_pham_id: number
  so_sao: number
  noi_dung?: string
}) => {
  const response = await fetch("http://localhost:3000/api/danh-gia", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  })

  if (!response.ok) {
    throw new Error("Failed to create review")
  }

  return await response.json()
}

// Lấy danh sách đánh giá của sản phẩm
export const fetchProductReviews = async (productId: number) => {
  const response = await fetch(`http://localhost:3000/api/san-pham/${productId}/danh-gia`)

  if (!response.ok) {
    throw new Error("Failed to fetch product reviews")
  }

  return await response.json()
}

// Kiểm tra xem người dùng đã đánh giá sản phẩm chưa
export const checkUserReview = async (userId: number, productId: number) => {
  const response = await fetch(
    `http://localhost:3000/api/danh-gia/check?nguoi_dung_id=${userId}&san_pham_id=${productId}`,
  )

  if (!response.ok) {
    throw new Error("Failed to check user review")
  }

  return await response.json()
}
// Lấy tất cả đánh giá (cho trang quản lý)
export const fetchAllReviews = async () => {
  const response = await fetch("http://localhost:3000/api/xem-danh-gia")

  if (!response.ok) {
    throw new Error("Failed to fetch all reviews")
  }

  return await response.json()
}
// Lấy tổng quan đánh giá (4 đánh giá mới nhất + đánh giá trung bình)
export const fetchReviewsOverview = async () => {
  const response = await fetch("http://localhost:3000/api/danh-gia/tong-quan")

  if (!response.ok) {
    throw new Error("Failed to fetch reviews overview")
  }

  return await response.json()
}