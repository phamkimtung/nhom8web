"use client"

import { Row, Col, Card, Statistic, Progress, Tag, Table, Tabs, Typography } from "antd"
import { ShoppingOutlined, InboxOutlined, DollarOutlined, UserOutlined } from "@ant-design/icons"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import type { ProductWithInventory, OrderStats } from "../hooks/use-dashboard-data"
import type { Order } from "@/types/order"

const { Text } = Typography

interface DashboardOverviewProps {
  products: ProductWithInventory[]
  orders: Order[]
  customerCount: number
  orderStats: OrderStats
  totalRevenue: number
  totalInventoryCount: number
  router: AppRouterInstance
  updateOrderStatus: (orderId: number, newStatus: string) => Promise<boolean>
}

export default function DashboardOverview({
  products,
  orders,
  customerCount,
  orderStats,
  totalRevenue,
  totalInventoryCount,
  router,
  updateOrderStatus,
}: DashboardOverviewProps) {
  // Columns cho bảng tồn kho sản phẩm
  const inventoryColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "ten",
      key: "ten",
      render: (text: string, record: ProductWithInventory) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">{record.danh_muc}</div>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "gia",
      key: "gia",
      render: (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price),
      sorter: (a: ProductWithInventory, b: ProductWithInventory) => a.gia - b.gia,
    },
    {
      title: "Tổng tồn kho",
      dataIndex: "totalStock",
      key: "totalStock",
      sorter: (a: ProductWithInventory, b: ProductWithInventory) => a.totalStock - b.totalStock,
      render: (totalStock: number, record: ProductWithInventory) => {
        // Xác định màu sắc dựa trên số lượng tồn kho
        let color = "green"
        if (totalStock <= 5) {
          color = "red"
        } else if (totalStock <= 20) {
          color = "orange"
        }

        return (
          <div>
            <Tag color={color}>{totalStock} sản phẩm</Tag>
            <Progress percent={Math.min(100, totalStock / 2)} showInfo={false} strokeColor={color} size="small" />
          </div>
        )
      },
    },
    {
      title: "Chi tiết kích cỡ",
      key: "sizes",
      render: (_: any, record: ProductWithInventory) => (
        <div className="flex flex-wrap gap-1">
          {record.inventory.map((item) => (
            <Tag key={item.id} color={item.so_luong <= 5 ? "red" : item.so_luong <= 20 ? "orange" : "green"}>
              {item.kich_co}: {item.so_luong}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ProductWithInventory) => (
        <a onClick={() => router.push(`/dashboard?tab=products`)}>Quản lý</a>
      ),
    },
  ]

  // Cập nhật hàm getStatusTag để hỗ trợ cả tên trạng thái tiếng Việt và tiếng Anh
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

  // Columns cho bảng đơn hàng gần đây
  const recentOrderColumns = [
    {
      title: "Mã đơn",
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
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Order) => <a onClick={() => router.push(`/dashboard?tab=orders`)}>Xem</a>,
    },
  ]

  return (
    <>
      {/* Thống kê chính */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={orderStats.total}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className="mt-2">
              <Text type="secondary">
                {orderStats.cho_duyet} chờ duyệt, {orderStats.dang_xu_ly} đang xử lý
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn hoàn thành"
              value={orderStats.hoan_thanh}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#52c41a" }}
              suffix={<small>/{orderStats.total}</small>}
            />
            <div className="mt-2">
              <Progress
                percent={orderStats.total ? Math.round((orderStats.hoan_thanh / orderStats.total) * 100) : 0}
                size="small"
                status="success"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#cf1322" }}
              formatter={(value) =>
                `${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value as number)}`
              }
            />
            <div className="mt-2">
              <Text type="secondary">Từ {orderStats.hoan_thanh} đơn hàng hoàn thành</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={customerCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div className="mt-2">
              <Text type="secondary">
                <a onClick={() => router.push("/dashboard/customers")}>Xem chi tiết</a>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={products.length}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className="mt-2">
              <Text type="secondary">{products.filter((p) => p.totalStock <= 5).length} sản phẩm sắp hết hàng</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tổng số lượng trong kho"
              value={totalInventoryCount}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div className="mt-2">
              <Progress percent={Math.min(100, totalInventoryCount / 10)} size="small" status="active" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Thống kê đơn hàng theo trạng thái */}
      <Card title="Thống kê đơn hàng theo trạng thái" className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-orange-50 border-orange-200">
              <Statistic title="Chờ duyệt" value={orderStats.cho_duyet} valueStyle={{ color: "#fa8c16" }} />
              <Progress
                percent={orderStats.total ? Math.round((orderStats.cho_duyet / orderStats.total) * 100) : 0}
                size="small"
                strokeColor="#fa8c16"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-blue-50 border-blue-200">
              <Statistic title="Đang xử lý" value={orderStats.dang_xu_ly} valueStyle={{ color: "#1890ff" }} />
              <Progress
                percent={orderStats.total ? Math.round((orderStats.dang_xu_ly / orderStats.total) * 100) : 0}
                size="small"
                strokeColor="#1890ff"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-green-50 border-green-200">
              <Statistic title="Hoàn thành" value={orderStats.hoan_thanh} valueStyle={{ color: "#52c41a" }} />
              <Progress
                percent={orderStats.total ? Math.round((orderStats.hoan_thanh / orderStats.total) * 100) : 0}
                size="small"
                strokeColor="#52c41a"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="bg-red-50 border-red-200">
              <Statistic title="Đã hủy" value={orderStats.da_huy} valueStyle={{ color: "#f5222d" }} />
              <Progress
                percent={orderStats.total ? Math.round((orderStats.da_huy / orderStats.total) * 100) : 0}
                size="small"
                strokeColor="#f5222d"
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Tabs cho thống kê chi tiết */}
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Thống kê tồn kho",
            children: (
              <Card>
                <Table
                  columns={inventoryColumns}
                  dataSource={products.map((product) => ({ ...product, key: product.id }))}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            ),
          },
          {
            key: "2",
            label: "Đơn hàng gần đây",
            children: (
              <Card>
                <Table
                  columns={recentOrderColumns}
                  dataSource={orders.slice(0, 10).map((order) => ({ ...order, key: order.id }))}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            ),
          },
        ]}
      />
    </>
  )
}
