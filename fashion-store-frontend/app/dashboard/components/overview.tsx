"use client"

import { Row, Col, Card, Statistic, Progress, Tag, Table, Tabs, Typography } from "antd"
import { ShoppingOutlined, InboxOutlined, DollarOutlined, UserOutlined } from "@ant-design/icons"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
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

  // Dữ liệu cho biểu đồ tròn
  const pieChartData = [
    {
      name: "Chờ duyệt",
      value: orderStats.cho_duyet,
      color: "#fa8c16",
    },
    {
      name: "Đang xử lý",
      value: orderStats.dang_xu_ly,
      color: "#1890ff",
    },
    {
      name: "Hoàn thành",
      value: orderStats.hoan_thanh,
      color: "#52c41a",
    },
    {
      name: "Đã hủy",
      value: orderStats.da_huy,
      color: "#f5222d",
    },
  ].filter((item) => item.value > 0) // Chỉ hiển thị các trạng thái có giá trị > 0

  // Custom label cho pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Không hiển thị label nếu phần trăm quá nhỏ

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium" style={{ color: data.payload.color }}>
            {data.name}: {data.value} đơn hàng
          </p>
          <p className="text-sm text-gray-600">
            {orderStats.total > 0 ? ((data.value / orderStats.total) * 100).toFixed(1) : 0}% tổng số đơn hàng
          </p>
        </div>
      )
    }
    return null
  }

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

      {/* Biểu đồ tròn thống kê đơn hàng theo trạng thái */}
      <Card title="Thống kê đơn hàng theo trạng thái" className="mb-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <div className="h-80">
              {orderStats.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: entry.color }}>
                          {value} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Text type="secondary">Chưa có đơn hàng nào</Text>
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{orderStats.total}</div>
                <Text className="text-gray-600">Tổng số đơn hàng</Text>
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={12} sm={12}>
                  <Card className="bg-orange-50 border-orange-200 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{orderStats.cho_duyet}</div>
                    <Text className="text-orange-600">Chờ duyệt</Text>
                    <div className="text-xs text-gray-500 mt-1">
                      {orderStats.total ? ((orderStats.cho_duyet / orderStats.total) * 100).toFixed(1) : 0}%
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={12}>
                  <Card className="bg-blue-50 border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{orderStats.dang_xu_ly}</div>
                    <Text className="text-blue-600">Đang xử lý</Text>
                    <div className="text-xs text-gray-500 mt-1">
                      {orderStats.total ? ((orderStats.dang_xu_ly / orderStats.total) * 100).toFixed(1) : 0}%
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={12}>
                  <Card className="bg-green-50 border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{orderStats.hoan_thanh}</div>
                    <Text className="text-green-600">Hoàn thành</Text>
                    <div className="text-xs text-gray-500 mt-1">
                      {orderStats.total ? ((orderStats.hoan_thanh / orderStats.total) * 100).toFixed(1) : 0}%
                    </div>
                  </Card>
                </Col>
                <Col xs={12} sm={12}>
                  <Card className="bg-red-50 border-red-200 text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">{orderStats.da_huy}</div>
                    <Text className="text-red-600">Đã hủy</Text>
                    <div className="text-xs text-gray-500 mt-1">
                      {orderStats.total ? ((orderStats.da_huy / orderStats.total) * 100).toFixed(1) : 0}%
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
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
