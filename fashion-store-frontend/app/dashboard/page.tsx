"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Layout, Typography, Spin, App } from "antd"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardOverview from "./components/overview"
import DashboardProducts from "./components/products"
import DashboardOrders from "./components/orders"
import useDashboardData from "./hooks/use-dashboard-data"

const { Content } = Layout
const { Title } = Typography

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { message } = App.useApp()
  const [activeTab, setActiveTab] = useState("overview")

  const {
    loading,
    storeId,
    products,
    orders,
    customerCount,
    orderStats,
    totalRevenue,
    totalInventoryCount,
    loadData,
    updateProduct,
    deleteProduct,
    updateInventory,
    updateOrderStatus,
  } = useDashboardData()

  // Xác định tab hiện tại từ URL
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "products") {
      setActiveTab("products")
    } else if (tab === "orders") {
      setActiveTab("orders")
    } else {
      setActiveTab("overview")
    }
  }, [searchParams])

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")

    if (!userId || userRole !== "cua_hang") {
      message.warning("Bạn không có quyền truy cập trang này")
      router.push("/login")
      return
    }

    loadData()
  }, [router, message, loadData])

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <DashboardSidebar />
        <Layout className="site-layout">
          <Content className="p-4 sm:p-6 lg:p-8 flex justify-center items-center">
            <Spin size="large" />
          </Content>
        </Layout>
      </Layout>
    )
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case "products":
        return "Quản lý sản phẩm"
      case "orders":
        return "Quản lý đơn hàng"
      default:
        return "Tổng quan cửa hàng"
    }
  }

  return (
    <Layout className="min-h-screen">
      <DashboardSidebar />
      <Layout className="site-layout">
        <Content className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <Title level={2}>{getPageTitle()}</Title>
          </div>

          {activeTab === "overview" && (
            <DashboardOverview
              products={products}
              orders={orders}
              customerCount={customerCount}
              orderStats={orderStats}
              totalRevenue={totalRevenue}
              totalInventoryCount={totalInventoryCount}
              router={router}
              updateOrderStatus={updateOrderStatus}
            />
          )}

          {activeTab === "products" && (
            <DashboardProducts
              storeId={storeId}
              products={products}
              updateProduct={updateProduct}
              deleteProduct={deleteProduct}
              updateInventory={updateInventory}
            />
          )}

          {activeTab === "orders" && <DashboardOrders orders={orders} updateOrderStatus={updateOrderStatus} />}
        </Content>
      </Layout>
    </Layout>
  )
}
