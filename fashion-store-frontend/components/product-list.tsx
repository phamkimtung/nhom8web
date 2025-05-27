"use client"

import { useState } from "react"
import { Row, Col, Card, Typography, Rate, Empty, Pagination } from "antd"
import { useRouter } from "next/navigation"
import type { Product } from "@/types/product"

const { Meta } = Card
const { Text, Title } = Typography

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  const handleProductClick = (id: number) => {
    router.push(`/product/${id}`)
  }

  // Helper function để chuyển đổi rating an toàn
  const getRating = (rating: any): number => {
    if (rating === null || rating === undefined) return 0
    const numRating = typeof rating === "string" ? Number.parseFloat(rating) : rating
    return isNaN(numRating) ? 0 : numRating
  }

  // Phân trang
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentProducts = products.slice(startIndex, endIndex)

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <Empty
          description={
            <div>
              <Title level={4}>Không tìm thấy sản phẩm nào</Title>
              <Text className="text-gray-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Text>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div>
      {/* Header với thông tin sản phẩm */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Text className="text-gray-600">
            Hiển thị {startIndex + 1}-{Math.min(endIndex, products.length)} trong tổng số {products.length} sản phẩm
          </Text>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <Row gutter={[24, 24]}>
        {currentProducts.map((product) => {
          const rating = getRating(product.danh_gia_trung_binh)

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Card
                hoverable
                className="h-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                cover={
                  <div className="relative overflow-hidden">
                    <img
                      alt={product.ten}
                      src={product.duong_dan_anh || "/placeholder.svg?height=300&width=300"}
                      className="h-64 w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                }
                onClick={() => handleProductClick(product.id)}
              >
                <Meta
                  title={
                    <div className="space-y-2">
                      <Text className="font-semibold text-lg line-clamp-2 block">{product.ten}</Text>
                      <Text className="text-red-500 font-bold text-xl block">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.gia)}
                      </Text>
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <Text className="block text-gray-500 capitalize">{product.danh_muc}</Text>
                      {product.ten_cua_hang && (
                        <Text className="block text-blue-500 text-sm">Cửa hàng: {product.ten_cua_hang}</Text>
                      )}
                      <div className="flex items-center justify-between">
                        <Rate disabled defaultValue={rating} className="text-sm" allowHalf />
                        <Text className="text-gray-400 text-sm">({rating.toFixed(1)})</Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          )
        })}
      </Row>

      {/* Phân trang */}
      {products.length > pageSize && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            total={products.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} trong ${total} sản phẩm`}
          />
        </div>
      )}
    </div>
  )
}
