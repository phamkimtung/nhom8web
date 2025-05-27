"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Layout, Menu, Input, Button, Drawer, Badge, Avatar, Dropdown, Space, Divider } from "antd"
import {
  MenuOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  DashboardOutlined,
} from "@ant-design/icons"
import { useMobile } from "@/hooks/use-mobile"

const { Header } = Layout
const { Search } = Input

interface NavbarProps {
  onSearch?: (value: string) => void
}

export default function Navbar({ onSearch }: NavbarProps) {
  const router = useRouter()
  const isMobile = useMobile()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("userRole")
    setIsLoggedIn(!!token)
    setUserRole(role)
  }, [])

  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userRole")
    setIsLoggedIn(false)
    setUserRole(null)
    router.push("/login")
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="orders" icon={<ShoppingOutlined />}>
        <Link href="/orders">Đơn hàng của tôi</Link>
      </Menu.Item>
      {userRole === "cua_hang" && (
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link href="/dashboard">Quản lý cửa hàng</Link>
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  )

  const menuItems = [
    { key: "home", label: <Link href="/">Trang chủ</Link> },
    { key: "products", label: <Link href="/products">Sản phẩm</Link> },
    { key: "about", label: <Link href="/">Giới thiệu</Link> },
    { key: "contact", label: <Link href="/">Liên hệ</Link> },
  ]

  return (
    <Header className="bg-white shadow-sm px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      <div className="flex items-center">
        {isMobile && (
          <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} className="mr-3" />
        )}
        <Link href="/" className="text-xl font-bold text-red-500">
          Fashion Store
        </Link>
      </div>

      {!isMobile && (
        <div className="hidden md:flex">
          <Menu mode="horizontal" className="border-0" items={menuItems} />
        </div>
      )}

      <div className="flex items-center">
        <Search
          placeholder="Tìm kiếm sản phẩm"
          onSearch={handleSearch}
          className="mr-4 hidden md:block"
          style={{ width: 250 }}
        />

        <Space size="middle">
          <Badge count={0}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: 24 }} />}
              onClick={() => router.push("/orders")}
            />
          </Badge>

          {isLoggedIn ? (
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <Button type="text">
                <Avatar icon={<UserOutlined />} />
              </Button>
            </Dropdown>
          ) : (
            <Button type="primary" onClick={() => router.push("/login")}>
              Đăng nhập
            </Button>
          )}
        </Space>
      </div>

      <Drawer title="Menu" placement="left" onClose={() => setDrawerVisible(false)} open={drawerVisible}>
        <Menu mode="vertical" items={menuItems} />
        <Divider />
        <Search placeholder="Tìm kiếm sản phẩm" onSearch={handleSearch} className="mb-4" />
      </Drawer>
    </Header>
  )
}
