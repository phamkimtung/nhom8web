"use client"

import { useState, useEffect } from "react"
import { Card, Typography, Rate, Button, Form, Input, List, Avatar, Divider, Empty, App, Space } from "antd"
import { UserOutlined, StarOutlined } from "@ant-design/icons"
import { fetchProductReviews, createReview, checkUserReview } from "@/lib/api"
import type { Review } from "@/types/product"

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface ProductReviewsProps {
  productId: number
  averageRating: number | string | null
}

export default function ProductReviews({ productId, averageRating }: ProductReviewsProps) {
  const { message } = App.useApp()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [form] = Form.useForm()

  // Helper function để chuyển đổi rating an toàn
  const getRating = (rating: any): number => {
    if (rating === null || rating === undefined) return 0
    const numRating = typeof rating === "string" ? Number.parseFloat(rating) : rating
    return isNaN(numRating) ? 0 : numRating
  }

  const safeAverageRating = getRating(averageRating)

  useEffect(() => {
    loadReviews()
    checkIfUserReviewed()
  }, [productId])

  const loadReviews = async () => {
    try {
      const data = await fetchProductReviews(productId)
      setReviews(data)
    } catch (error) {
      console.error("Failed to fetch reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkIfUserReviewed = async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) return

    try {
      const result = await checkUserReview(Number.parseInt(userId), productId)
      setHasReviewed(result.has_reviewed)
    } catch (error) {
      console.error("Failed to check user review:", error)
    }
  }

  const handleSubmitReview = async (values: any) => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      message.warning("Vui lòng đăng nhập để đánh giá sản phẩm")
      return
    }

    setSubmitting(true)
    try {
      await createReview({
        nguoi_dung_id: Number.parseInt(userId),
        san_pham_id: productId,
        so_sao: values.rating,
        noi_dung: values.comment,
      })

      message.success("Đánh giá thành công!")
      form.resetFields()
      setShowReviewForm(false)
      setHasReviewed(true)
      loadReviews() // Reload reviews
    } catch (error) {
      console.error("Failed to submit review:", error)
      message.error("Không thể gửi đánh giá. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0] // 1-5 stars
    reviews.forEach((review) => {
      if (review.so_sao >= 1 && review.so_sao <= 5) {
        distribution[review.so_sao - 1]++
      }
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()
  const totalReviews = reviews.length

  return (
    <Card className="mt-8">
      <Title level={4}>Đánh giá sản phẩm</Title>

      {/* Tổng quan đánh giá */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">{safeAverageRating.toFixed(1)}</div>
            <Rate disabled value={safeAverageRating} allowHalf className="text-lg" />
            <div className="text-gray-500 text-sm">{totalReviews} đánh giá</div>
          </div>

          <div className="flex-1 max-w-md">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-2 mb-1">
                <span className="text-sm w-8">{star} ⭐</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full"
                    style={{
                      width: totalReviews > 0 ? `${(ratingDistribution[star - 1] / totalReviews) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">{ratingDistribution[star - 1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* Form đánh giá */}
      {!hasReviewed && (
        <div className="mb-6">
          {!showReviewForm ? (
            <Button type="primary" icon={<StarOutlined />} onClick={() => setShowReviewForm(true)}>
              Viết đánh giá
            </Button>
          ) : (
            <Card className="bg-gray-50">
              <Title level={5}>Đánh giá của bạn</Title>
              <Form form={form} onFinish={handleSubmitReview} layout="vertical">
                <Form.Item name="rating" label="Số sao" rules={[{ required: true, message: "Vui lòng chọn số sao" }]}>
                  <Rate />
                </Form.Item>
                <Form.Item name="comment" label="Nhận xét (tùy chọn)">
                  <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      Gửi đánh giá
                    </Button>
                    <Button onClick={() => setShowReviewForm(false)}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}
        </div>
      )}

      {hasReviewed && (
        <div className="mb-6">
          <Text className="text-green-600">✓ Bạn đã đánh giá sản phẩm này</Text>
        </div>
      )}

      <Divider />

      {/* Danh sách đánh giá */}
      <Title level={5}>Tất cả đánh giá ({totalReviews})</Title>

      {loading ? (
        <div className="text-center py-8">Đang tải đánh giá...</div>
      ) : reviews.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={reviews}
          renderItem={(review) => (
            <List.Item key={review.id}>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <div className="flex items-center space-x-2">
                    <span>{review.ten_nguoi_dung || `Người dùng ${review.nguoi_dung_id}`}</span>
                    <Rate disabled value={review.so_sao} className="text-sm" />
                  </div>
                }
                description={
                  <div>
                    <div className="text-gray-500 text-sm mb-2">
                      {new Date(review.tao_luc).toLocaleDateString("vi-VN")}
                    </div>
                    {review.noi_dung && <Paragraph className="mb-0">{review.noi_dung}</Paragraph>}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Chưa có đánh giá nào cho sản phẩm này" />
      )}
    </Card>
  )
}
