"use client"

import { useState, useCallback } from "react"
import { App } from "antd"
import type { Product } from "@/types/product"
import type { Inventory } from "@/types/inventory"
import type { Order } from "@/types/order"
import {
  fetchStoreByUserId,
  fetchStoreProducts,
  fetchProductInventory,
  fetchStoreOrders,
  fetchStoreCustomerCount,
  createProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  addProductInventory,
  updateInventory as apiUpdateInventory,
  updateOrderStatus as apiUpdateOrderStatus,
} from "@/lib/api"

export interface ProductWithInventory extends Product {
  inventory: Inventory[]
  totalStock: number
}

export interface OrderStats {
  total: number
  cho_duyet: number
  dang_xu_ly: number
  hoan_thanh: number
  da_huy: number
}

export function useDashboardData() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState<number | null>(null)
  const [products, setProducts] = useState<ProductWithInventory[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    cho_duyet: 0,
    dang_xu_ly: 0,
    hoan_thanh: 0,
    da_huy: 0,
  })
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalInventoryCount, setTotalInventoryCount] = useState(0)

  // Cập nhật hàm loadData để sử dụng API mới
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        throw new Error("User ID not found")
      }

      const storeData = await fetchStoreByUserId(Number.parseInt(userId))
      if (storeData && storeData.length > 0) {
        const currentStoreId = storeData[0].id
        setStoreId(currentStoreId)

        // Tải sản phẩm và tồn kho
        const productsData = await fetchStoreProducts(currentStoreId)

        // Tải thông tin tồn kho cho từng sản phẩm
        const productsWithInventory = await Promise.all(
          productsData.map(async (product: Product) => {
            const inventory = await fetchProductInventory(product.id)
            const totalStock = inventory.reduce((sum: number, item: Inventory) => sum + item.so_luong, 0)
            return {
              ...product,
              inventory,
              totalStock,
            }
          }),
        )

        setProducts(productsWithInventory)

        // Tính tổng số lượng hàng trong kho
        const totalCount = productsWithInventory.reduce((sum, product) => sum + product.totalStock, 0)
        setTotalInventoryCount(totalCount)

        // Tải tất cả đơn hàng (không cần storeId nữa)
        const ordersData = await fetchStoreOrders()
        setOrders(ordersData)

        // Tính thống kê đơn hàng
        const stats = {
          total: ordersData.length,
          cho_duyet: ordersData.filter(
            (order: Order) => order.trang_thai === "cho_duyet" || order.trang_thai === "pending",
          ).length,
          dang_xu_ly: ordersData.filter(
            (order: Order) => order.trang_thai === "dang_xu_ly" || order.trang_thai === "processing",
          ).length,
          hoan_thanh: ordersData.filter(
            (order: Order) => order.trang_thai === "hoan_thanh" || order.trang_thai === "completed",
          ).length,
          da_huy: ordersData.filter((order: Order) => order.trang_thai === "da_huy" || order.trang_thai === "cancelled")
            .length,
        }
        setOrderStats(stats)

        // Tính tổng doanh thu từ đơn hàng hoàn thành
        const revenue = ordersData
          .filter((order: Order) => order.trang_thai === "hoan_thanh" || order.trang_thai === "completed")
          .reduce((sum: number, order: Order) => sum + order.tong_tien, 0)
        setTotalRevenue(revenue)

        // Lấy số lượng khách hàng
        try {
          const customerCountData = await fetchStoreCustomerCount(currentStoreId)
          setCustomerCount(customerCountData.so_luong_khach || 0)
        } catch (error) {
          console.error("Failed to fetch customer count:", error)
          setCustomerCount(0)
        }
      } else {
        message.warning("Bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước.")
      }
    } catch (error) {
      console.error("Failed to fetch store data:", error)
      message.error("Không thể tải dữ liệu cửa hàng")
    } finally {
      setLoading(false)
    }
  }, [message])

  const addProduct = async (productData: Partial<Product>) => {
    if (!storeId) {
      message.error("Không tìm thấy thông tin cửa hàng")
      return null
    }

    try {
      const newProduct = await createProduct({
        ...productData,
        cua_hang_id: storeId,
      })

      // Cập nhật state
      const productWithInventory = {
        ...newProduct,
        inventory: [],
        totalStock: 0,
      }

      setProducts([...products, productWithInventory])
      message.success("Thêm sản phẩm thành công")
      return productWithInventory
    } catch (error) {
      console.error("Failed to add product:", error)
      message.error("Không thể thêm sản phẩm")
      return null
    }
  }

  const updateProduct = async (productId: number, productData: Partial<Product>) => {
    try {
      await apiUpdateProduct(productId, productData)

      // Cập nhật state
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, ...productData, inventory: p.inventory, totalStock: p.totalStock } : p,
        ),
      )

      message.success("Cập nhật sản phẩm thành công")
      return true
    } catch (error) {
      console.error("Failed to update product:", error)
      message.error("Không thể cập nhật sản phẩm")
      return false
    }
  }

  const deleteProduct = async (productId: number) => {
    try {
      await apiDeleteProduct(productId)

      // Cập nhật state
      const productToDelete = products.find((p) => p.id === productId)
      if (productToDelete) {
        setTotalInventoryCount(totalInventoryCount - (productToDelete.totalStock || 0))
      }

      setProducts(products.filter((p) => p.id !== productId))
      message.success("Xóa sản phẩm thành công")
      return true
    } catch (error) {
      console.error("Failed to delete product:", error)
      message.error("Không thể xóa sản phẩm")
      return false
    }
  }

  const updateInventory = async (productId: number, inventoryId: number | null, kich_co: string, so_luong: number) => {
    try {
      const product = products.find((p) => p.id === productId)
      if (!product) {
        message.error("Không tìm thấy sản phẩm")
        return false
      }

      const currentInventory = [...product.inventory]
      const existingInventoryIndex = currentInventory.findIndex((inv) =>
        inventoryId ? inv.id === inventoryId : inv.kich_co === kich_co,
      )

      // Tính toán sự thay đổi số lượng tồn kho
      let stockDifference = so_luong

      if (existingInventoryIndex >= 0) {
        // Cập nhật tồn kho hiện có
        stockDifference = so_luong - currentInventory[existingInventoryIndex].so_luong
        await apiUpdateInventory(currentInventory[existingInventoryIndex].id, so_luong)
        currentInventory[existingInventoryIndex].so_luong = so_luong
        message.success("Cập nhật tồn kho thành công")
      } else {
        // Thêm tồn kho mới
        const newInventory = await addProductInventory(productId, kich_co, so_luong)
        currentInventory.push(newInventory)
        message.success("Thêm kích cỡ mới thành công")
      }

      // Cập nhật tổng số lượng tồn kho của sản phẩm
      const newTotalStock = currentInventory.reduce((sum, item) => sum + item.so_luong, 0)

      // Cập nhật state
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, inventory: currentInventory, totalStock: newTotalStock } : p,
        ),
      )

      // Cập nhật tổng số lượng hàng trong kho
      setTotalInventoryCount(totalInventoryCount + stockDifference)

      return true
    } catch (error) {
      console.error("Failed to update inventory:", error)
      message.error("Không thể cập nhật tồn kho")
      return false
    }
  }

  // Cập nhật hàm updateOrderStatus để sử dụng API mới
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiUpdateOrderStatus(orderId, newStatus)

      // Tìm đơn hàng cần cập nhật
      const orderToUpdate = orders.find((o) => o.id === orderId)
      if (!orderToUpdate) {
        message.error("Không tìm thấy đơn hàng")
        return false
      }

      const oldStatus = orderToUpdate.trang_thai

      // Cập nhật state orders
      const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, trang_thai: newStatus } : order))
      setOrders(updatedOrders)

      // Cập nhật thống kê đơn hàng
      const newStats = { ...orderStats }

      // Giảm số lượng ở trạng thái cũ
      if (oldStatus === "cho_duyet" || oldStatus === "pending") newStats.cho_duyet--
      else if (oldStatus === "dang_xu_ly" || oldStatus === "processing") newStats.dang_xu_ly--
      else if (oldStatus === "hoan_thanh" || oldStatus === "completed") newStats.hoan_thanh--
      else if (oldStatus === "da_huy" || oldStatus === "cancelled") newStats.da_huy--

      // Tăng số lượng ở trạng thái mới
      if (newStatus === "cho_duyet" || newStatus === "pending") newStats.cho_duyet++
      else if (newStatus === "dang_xu_ly" || newStatus === "processing") newStats.dang_xu_ly++
      else if (newStatus === "hoan_thanh" || newStatus === "completed") newStats.hoan_thanh++
      else if (newStatus === "da_huy" || newStatus === "cancelled") newStats.da_huy++

      setOrderStats(newStats)

      // Cập nhật doanh thu nếu cần
      if (
        (newStatus === "hoan_thanh" || newStatus === "completed") &&
        oldStatus !== "hoan_thanh" &&
        oldStatus !== "completed"
      ) {
        setTotalRevenue(totalRevenue + orderToUpdate.tong_tien)
      } else if (
        (oldStatus === "hoan_thanh" || oldStatus === "completed") &&
        newStatus !== "hoan_thanh" &&
        newStatus !== "completed"
      ) {
        setTotalRevenue(totalRevenue - orderToUpdate.tong_tien)
      }

      message.success("Cập nhật trạng thái đơn hàng thành công")
      return true
    } catch (error) {
      console.error("Failed to update order status:", error)
      message.error("Không thể cập nhật trạng thái đơn hàng")
      return false
    }
  }

  return {
    loading,
    storeId,
    products,
    orders,
    customerCount,
    orderStats,
    totalRevenue,
    totalInventoryCount,
    loadData,
    addProduct,
    updateProduct,
    deleteProduct,
    updateInventory,
    updateOrderStatus,
  }
}
