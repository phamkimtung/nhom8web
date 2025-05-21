"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Layout, Menu, Button, Typography } from "antd"
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
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
  const isMobile = useMobile()
  const [collapsed, setCollapsed] = useState(isMobile)

  useEffect(() => {
    setCollapsed(isMobile)
  }, [isMobile])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Tổng quan</Link>,
    },
    {
      key: "products",
      icon: <AppstoreOutlined />,
      label: <Link href="/dashboard">Sản phẩm</Link>,
    },
    {
      key: "orders",
      icon: <ShoppingOutlined />,
      label: <Link href="/dashboard">Đơn hàng</Link>,
    },
    {
      key: "customers",
      icon: <UserOutlined />,
      label: <Link href="/dashboard">Khách hàng</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link href="/dashboard">Cài đặt</Link>,
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
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <Text strong className="text-lg">
            Admin Panel
          </Text>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      <Menu mode="inline" selectedKeys={[pathname.split("/")[1] || "dashboard"]} items={menuItems} />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout} block>
          {!collapsed && "Đăng xuất"}
        </Button>
      </div>
    </Sider>
  )
}
