"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Layout, Typography, Spin, Table, Tag, Button, Card, Empty, message } from "antd"
import { ShoppingOutlined } from "@ant-design/icons"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import type { Order } from "@/types/order"
import { fetchUserOrders } from "@/lib/api"

const { Content } = Layout
const { Title } = Typography

export default function Orders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      message.warning("Vui lòng đăng nhập để xem đơn hàng")
      router.push("/login")
      return
    }

    const loadOrders = async () => {
      try {
        const data = await fetchUserOrders(Number.parseInt(userId))
        setOrders(data)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        message.error("Không thể tải danh sách đơn hàng")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cho_duyet":
        return "orange"
      case "dang_xu_ly":
        return "blue"
      case "hoan_thanh":
        return "green"
      case "da_huy":
        return "red"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "cho_duyet":
        return "Chờ duyệt"
      case "dang_xu_ly":
        return "Đang xử lý"
      case "hoan_thanh":
        return "Hoàn thành"
      case "da_huy":
        return "Đã hủy"
      default:
        return status
    }
  }

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Ngày đặt",
      dataIndex: "ngay_dat",
      key: "ngay_dat",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      render: (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record: Order) => (
        <Button type="link" onClick={() => router.push(`/order/${record.id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-4 sm:p-6 lg:p-8">
        <Title level={2}>Đơn hàng của tôi</Title>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : orders.length > 0 ? (
          <Card>
            <Table
              columns={columns}
              dataSource={orders.map((order) => ({ ...order, key: order.id }))}
              pagination={{ pageSize: 10 }}
              responsive={true}
            />
          </Card>
        ) : (
          <Card>
            <Empty image={<ShoppingOutlined style={{ fontSize: 64 }} />} description="Bạn chưa có đơn hàng nào">
              <Button type="primary" onClick={() => router.push("/")}>
                Mua sắm ngay
              </Button>
            </Empty>
          </Card>
        )}
      </Content>
      <Footer />
    </Layout>
  )
}
