"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Layout,
  Typography,
  Spin,
  Table,
  Tag,
  Button,
  Card,
  Empty,
  message,
  Modal,
  Descriptions,
  List,
  Avatar,
  Divider,
} from "antd"
import { ShoppingOutlined, EyeOutlined } from "@ant-design/icons"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import type { Order } from "@/types/order"
import { fetchUserOrders, fetchOrderDetails } from "@/lib/api"

const { Content } = Layout
const { Title } = Typography

export default function Orders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

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
        return "Ch��� duyệt"
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

  const handleViewDetails = async (orderId: number) => {
    setSelectedOrderId(orderId)
    setModalVisible(true)
    setModalLoading(true)

    try {
      const details = await fetchOrderDetails(orderId)
      setOrderDetails(details)
    } catch (error) {
      console.error("Failed to fetch order details:", error)
      message.error("Không thể tải chi tiết đơn hàng")
    } finally {
      setModalLoading(false)
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
      render: (_: any, record: Order) => (
        <div className="space-x-2">
          <Button type="primary" icon={<EyeOutlined />} onClick={() => handleViewDetails(record.id)}>
            Chi tiết
          </Button>
        </div>
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
      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrderId}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {modalLoading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : orderDetails ? (
          <>
            <Descriptions bordered column={1} className="mb-4">
              <Descriptions.Item label="Mã đơn hàng">{orderDetails.don_hang_id}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(orderDetails.ngay_dat).toLocaleDateString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(orderDetails.tong_tien)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(orderDetails.trang_thai)}>{getStatusText(orderDetails.trang_thai)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{orderDetails.ten_dang_nhap}</Descriptions.Item>
              <Descriptions.Item label="Email">{orderDetails.email}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Typography.Title level={5}>Chi tiết sản phẩm</Typography.Title>
            <List
              itemLayout="horizontal"
              dataSource={orderDetails.chi_tiet_san_pham}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        shape="square"
                        size={64}
                        src={item.duong_dan_anh || "/placeholder.svg?height=64&width=64"}
                      />
                    }
                    title={item.ten_san_pham}
                    description={
                      <>
                        <div>Kích cỡ: {item.kich_co}</div>
                        <div>Số lượng: {item.so_luong}</div>
                        <div>
                          Giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.gia)}
                        </div>
                        <div>
                          Thành tiền:{" "}
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            item.gia * item.so_luong,
                          )}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        ) : (
          <div className="text-center py-5">
            <Typography.Text>Không tìm thấy thông tin đơn hàng</Typography.Text>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
