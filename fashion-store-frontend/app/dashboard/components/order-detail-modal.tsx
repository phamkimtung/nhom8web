"use client"

import { useState, useEffect } from "react"
import { Modal, Descriptions, Table, Tag, Button, Spin, Typography, Divider, Empty } from "antd"
import type { Order, OrderItem } from "@/types/order"
import { fetchOrder } from "@/lib/api"

const { Title, Text } = Typography

interface OrderDetailModalProps {
  visible: boolean
  orderId: number | null
  onClose: () => void
  updateOrderStatus: (orderId: number, newStatus: string) => Promise<boolean>
}

export default function OrderDetailModal({ visible, orderId, onClose, updateOrderStatus }: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (visible && orderId) {
      setLoading(true)
      fetchOrder(orderId)
        .then((data) => {
          setOrder(data)
        })
        .catch((error) => {
          console.error("Failed to fetch order details:", error)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setOrder(null)
    }
  }, [visible, orderId])

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return

    setUpdating(true)
    try {
      const success = await updateOrderStatus(order.id, newStatus)
      if (success) {
        // Cập nhật trạng thái đơn hàng trong state
        setOrder({ ...order, trang_thai: newStatus })
      }
    } finally {
      setUpdating(false)
    }
  }

  const getStatusTag = (status: string) => {
    let color = "default"
    let text = status

    switch (status) {
      case "cho_duyet":
      case "pending":
        color = "orange"
        text = "Chờ duyệt"
        break
      case "dang_xu_ly":
      case "processing":
        color = "blue"
        text = "Đang xử lý"
        break
      case "hoan_thanh":
      case "completed":
        color = "green"
        text = "Hoàn thành"
        break
      case "da_huy":
      case "cancelled":
        color = "red"
        text = "Đã hủy"
        break
    }

    return <Tag color={color}>{text}</Tag>
  }

  const orderItemColumns = [
    {
      title: "Sản phẩm ID",
      dataIndex: "san_pham_id",
      key: "san_pham_id",
    },
    {
      title: "Kích cỡ",
      dataIndex: "kich_co",
      key: "kich_co",
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      key: "so_luong",
    },
    {
      title: "Giá",
      dataIndex: "gia",
      key: "gia",
      render: (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price),
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_: unknown, record: OrderItem) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.gia * record.so_luong),
    },
  ]

  return (
    <Modal title="Chi tiết đơn hàng" open={visible} onCancel={onClose} footer={null} width={800}>
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : order ? (
        <>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã đơn hàng">{order.id}</Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {new Date(order.ngay_dat).toLocaleDateString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.tong_tien)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{getStatusTag(order.trang_thai)}</Descriptions.Item>
            <Descriptions.Item label="Khách hàng ID">{order.nguoi_dung_id}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <div className="mb-4">
            <Title level={5}>Cập nhật trạng thái</Title>
            <div className="flex space-x-2 mt-2">
              {(order.trang_thai === "cho_duyet" || order.trang_thai === "pending") && (
                <Button type="primary" onClick={() => handleUpdateStatus("processing")} loading={updating}>
                  Duyệt đơn
                </Button>
              )}

              {(order.trang_thai === "dang_xu_ly" || order.trang_thai === "processing") && (
                <Button type="primary" onClick={() => handleUpdateStatus("completed")} loading={updating}>
                  Hoàn thành
                </Button>
              )}

              {(order.trang_thai === "cho_duyet" ||
                order.trang_thai === "pending" ||
                order.trang_thai === "dang_xu_ly" ||
                order.trang_thai === "processing") && (
                <Button danger onClick={() => handleUpdateStatus("cancelled")} loading={updating}>
                  Hủy đơn
                </Button>
              )}
            </div>
          </div>

          <Divider />

          <Title level={5}>Chi tiết sản phẩm</Title>
          {order.chi_tiet && order.chi_tiet.length > 0 ? (
            <Table
              columns={orderItemColumns}
              dataSource={order.chi_tiet.map((item, index) => ({ ...item, key: index }))}
              pagination={false}
            />
          ) : (
            <Empty description="Không có thông tin chi tiết sản phẩm" />
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <Text>Không tìm thấy thông tin đơn hàng</Text>
        </div>
      )}
    </Modal>
  )
}
