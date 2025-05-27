"use client"

import { useState, useEffect } from "react"
import { Card, Table, Button, Tag, Typography, Space } from "antd"
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons"
import type { Order } from "@/types/order"
import OrderDetailModal from "./order-detail-modal"
import OrderFilter, { type OrderFilterValues } from "./order-filter"
import type { ColumnsType } from "antd/es/table"
import type { Key } from "react"
import { fetchOrdersByDateRange } from "@/lib/api"

const { Title } = Typography

interface DashboardOrdersProps {
  orders: Order[]
  updateOrderStatus: (orderId: number, newStatus: string) => Promise<boolean>
}

export default function DashboardOrders({ orders, updateOrderStatus }: DashboardOrdersProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFilteredOrders(orders)
  }, [orders])

  const showOrderDetail = (orderId: number) => {
    setSelectedOrderId(orderId)
    setDetailModalVisible(true)
  }

  // Cập nhật hàm handleFilter để hỗ trợ lọc theo ngày
  const handleFilter = async (filters: OrderFilterValues) => {
    setLoading(true)

    try {
      let result = [...orders]

      // Nếu có lọc theo ngày, gọi API để lấy dữ liệu từ server
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const startDate = filters.dateRange[0].format("YYYY-MM-DD")
        const endDate = filters.dateRange[1].format("YYYY-MM-DD")

        // Gọi API để lấy đơn hàng theo khoảng ngày
        const ordersFromAPI = await fetchOrdersByDateRange(startDate, endDate)

        // Chuyển đổi dữ liệu từ API về format Order
        result = ordersFromAPI.map((order: any) => ({
          id: order.id,
          nguoi_dung_id: order.nguoi_dung_id,
          trang_thai: order.trang_thai,
          tong_tien: order.tong_tien,
          ngay_dat: order.ngay_dat,
        }))
      }

      // Lọc theo mã đơn hàng
      if (filters.orderId) {
        result = result.filter((order) => order.id.toString().includes(filters.orderId!))
      }

      // Lọc theo trạng thái
      if (filters.status) {
        result = result.filter((order) => {
          const orderStatus = order.trang_thai

          // Kiểm tra trạng thái trực tiếp hoặc mapping
          if (filters.status === "pending") {
            return orderStatus === "cho_duyet" || orderStatus === "pending"
          } else if (filters.status === "processing") {
            return orderStatus === "dang_xu_ly" || orderStatus === "processing"
          } else if (filters.status === "completed") {
            return orderStatus === "hoan_thanh" || orderStatus === "completed"
          } else if (filters.status === "cancelled") {
            return orderStatus === "da_huy" || orderStatus === "cancelled"
          }

          // Fallback: so sánh trực tiếp
          return orderStatus === filters.status
        })
      }

      // Lọc theo mã khách hàng
      if (filters.customerId) {
        result = result.filter((order) => order.nguoi_dung_id.toString().includes(filters.customerId!))
      }

      setFilteredOrders(result)
    } catch (error) {
      console.error("Failed to filter orders:", error)
      // Nếu có lỗi, vẫn hiển thị kết quả lọc từ dữ liệu hiện có
      let result = [...orders]

      // Lọc theo mã đơn hàng
      if (filters.orderId) {
        result = result.filter((order) => order.id.toString().includes(filters.orderId!))
      }

      // Lọc theo trạng thái
      if (filters.status) {
        result = result.filter((order) => {
          const orderStatus = order.trang_thai
          return orderStatus === filters.status
        })
      }

      // Lọc theo mã khách hàng
      if (filters.customerId) {
        result = result.filter((order) => order.nguoi_dung_id.toString().includes(filters.customerId!))
      }

      setFilteredOrders(result)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    // Tạo dữ liệu CSV
    const headers = ["Mã đơn hàng", "Ngày đặt", "Khách hàng", "Tổng tiền", "Trạng thái"]

    const getStatusText = (status: string) => {
      switch (status) {
        case "cho_duyet":
        case "pending":
          return "Chờ duyệt"
        case "dang_xu_ly":
        case "processing":
          return "Đang xử lý"
        case "hoan_thanh":
        case "completed":
          return "Hoàn thành"
        case "da_huy":
        case "cancelled":
          return "Đã hủy"
        default:
          return status
      }
    }

    const csvData = filteredOrders.map((order) => [
      order.id,
      new Date(order.ngay_dat).toLocaleDateString("vi-VN"),
      order.nguoi_dung_id,
      new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.tong_tien),
      getStatusText(order.trang_thai),
    ])

    // Thêm header vào đầu
    csvData.unshift(headers)

    // Chuyển đổi thành chuỗi CSV
    const csvContent = csvData.map((row) => row.join(",")).join("\n")

    // Tạo blob và download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `don-hang-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  // Columns cho bảng đơn hàng
  const orderColumns: ColumnsType<Order> = [
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
      sorter: (a: Order, b: Order) => new Date(a.ngay_dat).getTime() - new Date(b.ngay_dat).getTime(),
    },
    {
      title: "Khách hàng",
      dataIndex: "nguoi_dung_id",
      key: "nguoi_dung_id",
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      render: (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount),
      sorter: (a: Order, b: Order) => a.tong_tien - b.tong_tien,
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: "Chờ duyệt", value: "pending" },
        { text: "Đang xử lý", value: "processing" },
        { text: "Hoàn thành", value: "completed" },
        { text: "Đã hủy", value: "cancelled" },
      ],
      onFilter: (value: Key | boolean, record: Order) => {
        const stringValue = String(value)
        if (stringValue === "pending") return record.trang_thai === "cho_duyet" || record.trang_thai === "pending"
        if (stringValue === "processing")
          return record.trang_thai === "dang_xu_ly" || record.trang_thai === "processing"
        if (stringValue === "completed") return record.trang_thai === "hoan_thanh" || record.trang_thai === "completed"
        if (stringValue === "cancelled") return record.trang_thai === "da_huy" || record.trang_thai === "cancelled"
        return true
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: unknown, record: Order) => (
        <div className="space-x-2">
          <Button type="primary" onClick={() => showOrderDetail(record.id)} size="small">
            Chi tiết
          </Button>

          {(record.trang_thai === "cho_duyet" || record.trang_thai === "pending") && (
            <Button type="default" onClick={() => updateOrderStatus(record.id, "processing")} size="small">
              Duyệt đơn
            </Button>
          )}

          {(record.trang_thai === "dang_xu_ly" || record.trang_thai === "processing") && (
            <Button type="default" onClick={() => updateOrderStatus(record.id, "completed")} size="small">
              Hoàn thành
            </Button>
          )}

          {(record.trang_thai === "cho_duyet" ||
            record.trang_thai === "pending" ||
            record.trang_thai === "dang_xu_ly" ||
            record.trang_thai === "processing") && (
            <Button danger onClick={() => updateOrderStatus(record.id, "cancelled")} size="small">
              Hủy đơn
            </Button>
          )}
        </div>
      ),
    },
  ]

  // Cập nhật tiêu đề trang
  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <Title level={4}>Quản lý tất cả đơn hàng</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => setFilteredOrders(orders)}>
            Làm mới
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Xuất CSV
          </Button>
        </Space>
      </div>

      <OrderFilter onFilter={handleFilter} />

      <Card>
        <Table
          columns={orderColumns}
          dataSource={filteredOrders.map((order) => ({ ...order, key: order.id }))}
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      <OrderDetailModal
        visible={detailModalVisible}
        orderId={selectedOrderId}
        onClose={() => setDetailModalVisible(false)}
        updateOrderStatus={updateOrderStatus}
      />
    </>
  )
}
