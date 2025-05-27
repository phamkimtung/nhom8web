"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Layout,
  Typography,
  Spin,
  Card,
  Table,
  Rate,
  Avatar,
  Input,
  Select,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  App,
  Image,
} from "antd"
import { StarOutlined, UserOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { fetchAllReviews } from "@/lib/api"
import type { ColumnsType } from "antd/es/table"

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

interface ReviewData {
  id: number
  so_sao: number
  noi_dung: string
  tao_luc: string
  nguoi_dung_id: number
  ten_nguoi_dung: string
  san_pham_id: number
  ten_san_pham: string
  anh_san_pham: string
}

export default function ReviewsPage() {
  const router = useRouter()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [filteredReviews, setFilteredReviews] = useState<ReviewData[]>([])
  const [searchText, setSearchText] = useState("")
  const [filterRating, setFilterRating] = useState<number | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")

    if (!userId || userRole !== "cua_hang") {
      message.warning("Bạn không có quyền truy cập trang này")
      router.push("/login")
      return
    }

    loadReviews()
  }, [router, message])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const data = await fetchAllReviews()
      setReviews(data)
      setFilteredReviews(data)
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
      message.error("Không thể tải danh sách đánh giá")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    filterReviews(value, filterRating)
  }

  const handleRatingFilter = (rating: number | null) => {
    setFilterRating(rating)
    filterReviews(searchText, rating)
  }

  const filterReviews = (search: string, rating: number | null) => {
    let filtered = [...reviews]

    // Lọc theo tìm kiếm
    if (search) {
      filtered = filtered.filter(
        (review) =>
          review.ten_san_pham.toLowerCase().includes(search.toLowerCase()) ||
          review.ten_nguoi_dung.toLowerCase().includes(search.toLowerCase()) ||
          review.noi_dung.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Lọc theo số sao
    if (rating !== null) {
      filtered = filtered.filter((review) => review.so_sao === rating)
    }

    setFilteredReviews(filtered)
  }

  const handleReset = () => {
    setSearchText("")
    setFilterRating(null)
    setFilteredReviews(reviews)
  }

  // Tính toán thống kê
  const getStatistics = () => {
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.so_sao, 0) / totalReviews : 0

    const ratingDistribution = [0, 0, 0, 0, 0] // 1-5 stars
    reviews.forEach((review) => {
      if (review.so_sao >= 1 && review.so_sao <= 5) {
        ratingDistribution[review.so_sao - 1]++
      }
    })

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
    }
  }

  const statistics = getStatistics()

  const columns: ColumnsType<ReviewData> = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 250,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Image
            src={record.anh_san_pham || "/placeholder.svg?height=50&width=50"}
            alt={record.ten_san_pham}
            width={50}
            height={50}
            className="rounded object-cover"
            fallback="/placeholder.svg?height=50&width=50"
          />
          <div>
            <Text strong className="block">
              {record.ten_san_pham}
            </Text>
            <Text className="text-gray-500 text-xs">ID: {record.san_pham_id}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 150,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text className="block">{record.ten_nguoi_dung}</Text>
            <Text className="text-gray-500 text-xs">ID: {record.nguoi_dung_id}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "so_sao",
      key: "rating",
      width: 120,
      render: (rating: number) => (
        <div className="text-center">
          <Rate disabled value={rating} className="text-sm" />
          <div className="text-xs text-gray-500 mt-1">{rating}/5</div>
        </div>
      ),
      sorter: (a, b) => a.so_sao - b.so_sao,
      filters: [
        { text: "5 sao", value: 5 },
        { text: "4 sao", value: 4 },
        { text: "3 sao", value: 3 },
        { text: "2 sao", value: 2 },
        { text: "1 sao", value: 1 },
      ],
      onFilter: (value, record) => record.so_sao === value,
    },
    {
      title: "Nội dung",
      dataIndex: "noi_dung",
      key: "content",
      render: (content: string) => (
        <div className="max-w-xs">
          {content ? (
            <Text className="text-gray-700">{content}</Text>
          ) : (
            <Text className="text-gray-400 italic">Không có nhận xét</Text>
          )}
        </div>
      ),
    },
    {
      title: "Ngày đánh giá",
      dataIndex: "tao_luc",
      key: "date",
      width: 120,
      render: (date: string) => (
        <div className="text-center">
          <Text className="block">{new Date(date).toLocaleDateString("vi-VN")}</Text>
          <Text className="text-xs text-gray-500">{new Date(date).toLocaleTimeString("vi-VN")}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.tao_luc).getTime() - new Date(b.tao_luc).getTime(),
    },
  ]

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
          <Title level={2}>Quản lý đánh giá</Title>

          {/* Thống kê tổng quan */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Tổng số đánh giá"
                  value={statistics.totalReviews}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Đánh giá trung bình"
                  value={statistics.averageRating}
                  precision={1}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: "#faad14" }}
                  suffix="/ 5"
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Đánh giá 5 sao"
                  value={statistics.ratingDistribution[4]}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Đánh giá 1-2 sao"
                  value={statistics.ratingDistribution[0] + statistics.ratingDistribution[1]}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: "#f5222d" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Phân bố đánh giá */}
          <Card className="mb-6">
            <Title level={4}>Phân bố đánh giá</Title>
            <Row gutter={16}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Col xs={24} sm={12} md={8} lg={4} key={star}>
                  <div className="text-center p-4">
                    <div className="flex items-center justify-center mb-2">
                      <Rate disabled value={star} className="text-sm" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{statistics.ratingDistribution[star - 1]}</div>
                    <div className="text-gray-500 text-sm">đánh giá</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Bộ lọc */}
          <Card className="mb-4">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} md={6}>
                <Input.Search
                  placeholder="Tìm kiếm sản phẩm, khách hàng..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                />
              </Col>
              <Col xs={24} sm={6} md={4}>
                <Select
                  placeholder="Lọc theo sao"
                  allowClear
                  value={filterRating}
                  onChange={handleRatingFilter}
                  className="w-full"
                >
                  <Option value={5}>5 sao</Option>
                  <Option value={4}>4 sao</Option>
                  <Option value={3}>3 sao</Option>
                  <Option value={2}>2 sao</Option>
                  <Option value={1}>1 sao</Option>
                </Select>
              </Col>
              <Col xs={24} sm={6} md={4}>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={loadReviews}>
                    Làm mới
                  </Button>
                  <Button onClick={handleReset}>Xóa bộ lọc</Button>
                </Space>
              </Col>
              <Col xs={24} sm={4} md={10}>
                
              </Col>
            </Row>
          </Card>

          {/* Bảng đánh giá */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredReviews.map((review) => ({ ...review, key: review.id }))}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} đánh giá`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}
