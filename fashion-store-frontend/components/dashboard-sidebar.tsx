"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Layout, Menu, Button, Typography, App } from "antd"
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  StarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons"
import { useMobile } from "@/hooks/use-mobile"

const { Sider } = Layout
const { Text } = Typography

export default function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { message } = App.useApp()
  const isMobile = useMobile()
  const [collapsed, setCollapsed] = useState(isMobile)
  const [selectedKey, setSelectedKey] = useState("dashboard")

  useEffect(() => {
    setCollapsed(isMobile)
  }, [isMobile])

  useEffect(() => {
    // Xác định key dựa trên pathname
    if (pathname.includes("/dashboard/customers")) {
      setSelectedKey("customers")
    } else if (pathname.includes("/dashboard/reviews")) {
      setSelectedKey("reviews")
    } else if (
      pathname.includes("/dashboard/products") ||
      (pathname.includes("/dashboard") && pathname.includes("tab=products"))
    ) {
      setSelectedKey("products")
    } else if (
      pathname.includes("/dashboard/orders") ||
      (pathname.includes("/dashboard") && pathname.includes("tab=orders"))
    ) {
      setSelectedKey("orders")
    } else {
      setSelectedKey("dashboard")
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userRole")
    localStorage.removeItem("storeId")
    message.success("Đăng xuất thành công")
    router.push("/login")
  }

  const handleMenuClick = (key: string) => {
    setSelectedKey(key)

    // Chuyển hướng dựa trên key
    switch (key) {
      case "dashboard":
        router.push("/dashboard")
        break
      case "products":
        // Trong trường hợp này, vẫn ở trang dashboard nhưng chuyển tab
        router.push("/dashboard?tab=products")
        break
      case "orders":
        // Trong trường hợp này, vẫn ở trang dashboard nhưng chuyển tab
        router.push("/dashboard?tab=orders")
        break
      case "customers":
        router.push("/dashboard/customers")
        break
      case "reviews":
        router.push("/dashboard/reviews")
        break
      default:
        router.push("/dashboard")
    }
  }

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      onClick: () => handleMenuClick("dashboard"),
    },
    {
      key: "products",
      icon: <AppstoreOutlined />,
      label: "Sản phẩm",
      onClick: () => handleMenuClick("products"),
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: "Đơn hàng",
      onClick: () => handleMenuClick("orders"),
    },
    {
      key: "customers",
      icon: <UserOutlined />,
      label: "Khách hàng",
      onClick: () => handleMenuClick("customers"),
    },
    {
      key: "reviews",
      icon: <StarOutlined />,
      label: "Xem đánh giá",
      onClick: () => handleMenuClick("reviews"),
    },
  ]

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="bg-white shadow-sm"
      width={250}
      theme="light"
      trigger={null}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <Text strong className="text-lg">
            Quản lý cửa hàng
          </Text>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} className="border-r-0" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout} block>
          {!collapsed && "Đăng xuất"}
        </Button>
      </div>
    </Sider>
  )
}
