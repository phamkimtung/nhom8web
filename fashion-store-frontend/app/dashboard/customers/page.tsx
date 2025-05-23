"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Layout,
  Typography,
  Spin,
  Card,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Drawer,
  Descriptions,
  List,
  Divider,
  Badge,
  App,
  Empty,
  Input,
  Space,
  Collapse,
  Avatar,
} from "antd"
import { UserOutlined, ShoppingOutlined, ReloadOutlined, DownOutlined } from "@ant-design/icons"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { fetchCustomersOrdersSummary, fetchCustomerOrders } from "@/lib/api"
import type { ColumnsType } from "antd/es/table"

const { Content } = Layout
const { Title, Text } = Typography
const { Panel } = Collapse

interface CustomerSummary {
  id: number
  ten: string
  email: string
  tong_don: number
  cho_duyet: number
  dang_giao: number
  hoan_thanh: number
  da_huy: number
}

interface OrderProduct {
  san_pham_id: number
  ten_san_pham: string
  kich_co: string
  so_luong: number
  gia: number
  anh: string
}

interface CustomerOrder {
  don_hang_id: number
  ngay_dat: string
  tong_tien: number
  trang_thai: string
  san_pham: OrderProduct[]
}

export default function CustomersPage() {
  const router = useRouter()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerSummary[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")

    if (!userId || userRole !== "cua_hang") {
      message.warning("Bạn không có quyền truy cập trang này")
      router.push("/login")
      return
    }

    const loadCustomers = async () => {
      try {
        // Sử dụng API mới để lấy thông tin khách hàng và thống kê đơn hàng
        const customersData = await fetchCustomersOrdersSummary()
        setCustomers(customersData)
        setFilteredCustomers(customersData)
      } catch (error) {
        console.error("Failed to fetch customers:", error)
        message.error("Không thể tải danh sách khách hàng")
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [router, message])

  const showCustomerDetails = async (customer: CustomerSummary) => {
    setSelectedCustomer(customer)
    setDrawerVisible(true)
    setDrawerLoading(true)

    try {
      // Ahora llamamos directamente a fetchCustomerOrders con el ID del cliente
      const orders = await fetchCustomerOrders(customer.id)
      setCustomerOrders(orders)
    } catch (error) {
      console.error("Failed to fetch customer orders:", error)
      message.error("Không thể tải đơn hàng của khách hàng")
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (!value) {
      setFilteredCustomers(customers)
      return
    }

    const filtered = customers.filter(
      (customer) =>
        customer.ten.toLowerCase().includes(value.toLowerCase()) ||
        customer.email.toLowerCase().includes(value.toLowerCase()) ||
        customer.id.toString().includes(value),
    )
    setFilteredCustomers(filtered)
  }

  const columns: ColumnsType<CustomerSummary> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "ten",
      key: "ten",
      sorter: (a, b) => a.ten.localeCompare(b.ten),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Tổng đơn hàng",
      dataIndex: "tong_don",
      key: "tong_don",
      sorter: (a, b) => a.tong_don - b.tong_don,
      render: (value) => <Badge count={value} showZero color="blue" />,
    },
    {
      title: "Trạng thái đơn hàng",
      key: "trang_thai",
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.cho_duyet > 0 && <Tag color="orange">Chờ duyệt: {record.cho_duyet}</Tag>}
          {record.dang_giao > 0 && <Tag color="blue">Đang giao: {record.dang_giao}</Tag>}
          {record.hoan_thanh > 0 && <Tag color="green">Hoàn thành: {record.hoan_thanh}</Tag>}
          {record.da_huy > 0 && <Tag color="red">Đã hủy: {record.da_huy}</Tag>}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => showCustomerDetails(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ]

  const getStatusTag = (status: string) => {
    switch (status) {
      case "cho_duyet":
        return <Tag color="orange">Chờ duyệt</Tag>
      case "dang_xu_ly":
      case "dang_giao":
        return <Tag color="blue">Đang giao</Tag>
      case "hoan_thanh":
        return <Tag color="green">Hoàn thành</Tag>
      case "da_huy":
        return <Tag color="red">Đã hủy</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

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

  return (
    <Layout className="min-h-screen">
      <DashboardSidebar />
      <Layout className="site-layout">
        <Content className="p-4 sm:p-6 lg:p-8">
          <Title level={2}>Quản lý khách hàng</Title>

          {/* Thống kê tổng quan */}
          <Row gutter={16} className="mb-8">
            <Col xs={24} sm={6}>
              <Card>
                <Statistic title="Tổng số khách hàng" value={customers.length} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={customers.reduce((sum, customer) => sum + customer.tong_don, 0)}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Đơn chờ duyệt"
                  value={customers.reduce((sum, customer) => sum + customer.cho_duyet, 0)}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Đơn hoàn thành"
                  value={customers.reduce((sum, customer) => sum + customer.hoan_thanh, 0)}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Tìm kiếm */}
          <Card className="mb-4">
            <Space className="w-full justify-between">
              <Input.Search
                placeholder="Tìm kiếm theo tên, email hoặc ID"
                allowClear
                enterButton
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={handleSearch}
                style={{ width: 400 }}
              />
              <Button icon={<ReloadOutlined />} onClick={() => handleSearch("")}>
                Làm mới
              </Button>
            </Space>
          </Card>

          {/* Bảng danh sách khách hàng */}
          <Card title="Danh sách khách hàng">
            <Table
              columns={columns}
              dataSource={filteredCustomers.map((customer) => ({ ...customer, key: customer.id }))}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* Drawer chi tiết khách hàng */}
          <Drawer
            title="Chi tiết khách hàng"
            placement="right"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={800}
          >
            {selectedCustomer && (
              <>
                <Descriptions title="Thông tin khách hàng" bordered column={1}>
                  <Descriptions.Item label="ID">{selectedCustomer.id}</Descriptions.Item>
                  <Descriptions.Item label="Tên đăng nhập">{selectedCustomer.ten}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedCustomer.email}</Descriptions.Item>
                </Descriptions>

                <Divider />

                <Title level={4}>Thống kê đơn hàng</Title>
                <Row gutter={16} className="mb-4">
                  <Col span={6}>
                    <Badge count={selectedCustomer.cho_duyet} overflowCount={99} style={{ backgroundColor: "#fa8c16" }}>
                      <Card size="small">
                        <Statistic
                          title="Chờ duyệt"
                          value={selectedCustomer.cho_duyet}
                          valueStyle={{ color: "#fa8c16" }}
                        />
                      </Card>
                    </Badge>
                  </Col>
                  <Col span={6}>
                    <Badge count={selectedCustomer.dang_giao} overflowCount={99} style={{ backgroundColor: "#1890ff" }}>
                      <Card size="small">
                        <Statistic
                          title="Đang giao"
                          value={selectedCustomer.dang_giao}
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Card>
                    </Badge>
                  </Col>
                  <Col span={6}>
                    <Badge
                      count={selectedCustomer.hoan_thanh}
                      overflowCount={99}
                      style={{ backgroundColor: "#52c41a" }}
                    >
                      <Card size="small">
                        <Statistic
                          title="Hoàn thành"
                          value={selectedCustomer.hoan_thanh}
                          valueStyle={{ color: "#52c41a" }}
                        />
                      </Card>
                    </Badge>
                  </Col>
                  <Col span={6}>
                    <Badge count={selectedCustomer.da_huy} overflowCount={99} style={{ backgroundColor: "#f5222d" }}>
                      <Card size="small">
                        <Statistic title="Đã hủy" value={selectedCustomer.da_huy} valueStyle={{ color: "#f5222d" }} />
                      </Card>
                    </Badge>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>Lịch sử đơn hàng</Title>
                {drawerLoading ? (
                  <div className="flex justify-center py-10">
                    <Spin />
                  </div>
                ) : customerOrders.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={customerOrders}
                    renderItem={(order) => (
                      <Card className="mb-4" key={order.don_hang_id}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Title level={5}>Đơn hàng #{order.don_hang_id}</Title>
                            <Text className="block">
                              Ngày đặt: {new Date(order.ngay_dat).toLocaleDateString("vi-VN")}
                            </Text>
                            <Text className="block">
                              Tổng tiền:{" "}
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                order.tong_tien,
                              )}
                            </Text>
                            <Text className="block">Trạng thái: {getStatusTag(order.trang_thai)}</Text>
                          </div>
                          <Button size="small" onClick={() => router.push(`/dashboard/orders/${order.don_hang_id}`)}>
                            Xem chi tiết
                          </Button>
                        </div>

                        <Collapse ghost expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}>
                          <Panel header="Danh sách sản phẩm" key="1">
                            <List
                              dataSource={order.san_pham}
                              renderItem={(product) => (
                                <List.Item key={`${order.don_hang_id}-${product.san_pham_id}-${product.kich_co}`}>
                                  <List.Item.Meta
                                    avatar={
                                      <Avatar
                                        shape="square"
                                        size={64}
                                        src={product.anh || "/placeholder.svg?height=64&width=64"}
                                      />
                                    }
                                    title={product.ten_san_pham}
                                    description={
                                      <>
                                        <Text className="block">Kích cỡ: {product.kich_co}</Text>
                                        <Text className="block">Số lượng: {product.so_luong}</Text>
                                        <Text className="block">
                                          Giá:{" "}
                                          {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                          }).format(product.gia)}
                                        </Text>
                                        <Text className="block">
                                          Thành tiền:{" "}
                                          {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                          }).format(product.gia * product.so_luong)}
                                        </Text>
                                      </>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          </Panel>
                        </Collapse>
                      </Card>
                    )}
                  />
                ) : (
                  <Empty description="Khách hàng chưa có đơn hàng nào" />
                )}
              </>
            )}
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  )
}
