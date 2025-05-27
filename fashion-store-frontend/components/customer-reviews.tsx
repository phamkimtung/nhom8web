"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Typography, Rate, Avatar, Spin } from "antd"
import { UserOutlined } from "@ant-design/icons"
import { fetchReviewsOverview } from "@/lib/api"

const { Title, Text, Paragraph } = Typography

interface ReviewData {
  id: number
  so_sao: number
  noi_dung: string
  tao_luc: string
  ten_nguoi_dung: string
  ten_san_pham: string
  anh_san_pham: string
}

interface ReviewsOverview {
  danh_gia_moi_nhat: ReviewData[]
  danh_gia_trung_binh: number
}

export default function CustomerReviews() {
  const [reviewsData, setReviewsData] = useState<ReviewsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadReviewsOverview = async () => {
      try {
        const data = await fetchReviewsOverview()
        setReviewsData(data)
      } catch (error) {
        console.error("Failed to fetch reviews overview:", error)
        // Fallback to default data if API fails
        setReviewsData({
          danh_gia_moi_nhat: [],
          danh_gia_trung_binh: 4.8,
        })
      } finally {
        setLoading(false)
      }
    }

    loadReviewsOverview()
  }, [])

  // Fallback reviews nếu không có dữ liệu từ API
  const fallbackReviews = [
    {
      id: 1,
      ten_nguoi_dung: "Nguyễn Thị Lan",
      so_sao: 5,
      noi_dung: "Chất lượng sản phẩm rất tốt, giao hàng nhanh. Tôi rất hài lòng với dịch vụ của shop.",
      ten_san_pham: "Đầm công sở",
      anh_san_pham: "/placeholder.svg?height=200&width=200",
      tao_luc: new Date().toISOString(),
    },
    {
      id: 2,
      ten_nguoi_dung: "Trần Văn Nam",
      so_sao: 5,
      noi_dung: "Áo thun chất liệu cotton mềm mại, form dáng đẹp. Sẽ ủng hộ shop lâu dài.",
      ten_san_pham: "Áo thun nam",
      anh_san_pham: "/placeholder.svg?height=200&width=200",
      tao_luc: new Date().toISOString(),
    },
    {
      id: 3,
      ten_nguoi_dung: "Lê Thị Hoa",
      so_sao: 4,
      noi_dung: "Váy đẹp, giá cả hợp lý. Nhân viên tư vấn nhiệt tình. Chỉ có điều giao hàng hơi chậm.",
      ten_san_pham: "Váy maxi",
      anh_san_pham: "/placeholder.svg?height=200&width=200",
      tao_luc: new Date().toISOString(),
    },
    {
      id: 4,
      ten_nguoi_dung: "Phạm Minh Tuấn",
      so_sao: 5,
      noi_dung: "Quần jeans chất lượng cao, đúng size. Đóng gói cẩn thận, giao hàng đúng hẹn.",
      ten_san_pham: "Quần jeans",
      anh_san_pham: "/placeholder.svg?height=200&width=200",
      tao_luc: new Date().toISOString(),
    },
  ]

  const reviews = reviewsData?.danh_gia_moi_nhat?.length ? reviewsData.danh_gia_moi_nhat : fallbackReviews.slice(0, 4)

  const averageRating = reviewsData?.danh_gia_trung_binh || 4.8
  const totalReviews = reviewsData?.danh_gia_moi_nhat?.length || fallbackReviews.length

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Title level={2} className="mb-4">
              Khách hàng nói gì về chúng tôi
            </Title>
            <p className="text-gray-600 text-lg">Những đánh giá chân thực từ khách hàng đã mua sắm</p>
          </div>
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Title level={2} className="mb-4">
            Khách hàng nói gì về chúng tôi
          </Title>
          <p className="text-gray-600 text-lg">Những đánh giá chân thực từ khách hàng đã mua sắm</p>
        </div>

        <Row gutter={[24, 24]}>
          {reviews.map((review) => (
            <Col xs={24} sm={12} md={6} key={review.id}>
              <Card className="h-full shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-4">
                  <Avatar size={60} icon={<UserOutlined />} className="mb-3" />
                  <Title level={5} className="mb-1">
                    {review.ten_nguoi_dung}
                  </Title>
                  <Rate disabled defaultValue={review.so_sao} className="text-sm" />
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(review.tao_luc).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <Paragraph className="text-gray-600 text-center mb-4 italic min-h-[60px]">
                  "{review.noi_dung || "Sản phẩm tuyệt vời, rất hài lòng!"}"
                </Paragraph>

                <div className="text-center">
                  <img
                    src={review.anh_san_pham || "/placeholder.svg?height=120&width=120"}
                    alt={review.ten_san_pham}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=120&width=120"
                    }}
                  />
                  <Text className="text-sm text-gray-500">Sản phẩm: {review.ten_san_pham}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg p-8 shadow-md inline-block">
            <Title level={3} className="text-green-600 mb-2">
              {averageRating}/5
            </Title>
            <Rate disabled defaultValue={averageRating} allowHalf className="mb-2" />
            <Text className="block text-gray-600">
              Dựa trên {totalReviews > 0 ? `${totalReviews}+` : "nhiều"} đánh giá
            </Text>
          </div>
        </div>
      </div>
    </section>
  )
}
