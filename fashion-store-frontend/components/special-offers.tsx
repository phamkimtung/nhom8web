"use client"

import { Row, Col, Card, Typography, Button, Tag } from "antd"
import { useRouter } from "next/navigation"
import type { Product } from "@/types/product"

const { Title, Text } = Typography
const { Meta } = Card

interface SpecialOffersProps {
  products: Product[]
}

export default function SpecialOffers({ products }: SpecialOffersProps) {
  const router = useRouter()

  const handleProductClick = (id: number) => {
    router.push(`/product/${id}`)
  }

  // Giả sử có giảm giá 20-50%
  const getDiscountPrice = (originalPrice: number) => {
    const discountPercent = Math.floor(Math.random() * 30) + 20 // 20-50%
    const discountedPrice = originalPrice * (1 - discountPercent / 100)
    return { discountedPrice, discountPercent }
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Title level={2} className="mb-4 text-red-600">
            🔥 Ưu đãi đặc biệt
          </Title>
          <p className="text-gray-600 text-lg">Giảm giá lên đến 50% cho những khách hàng lâu năm</p>
        </div>

        <Row gutter={[24, 24]}>
          {products.slice(0, 6).map((product) => {
            const { discountedPrice, discountPercent } = getDiscountPrice(product.gia)
            return (
              <Col xs={24} sm={12} md={8} lg={8} key={product.id}>
                <Card
                  hoverable
                  className="h-full shadow-lg hover:shadow-xl transition-all duration-300"
                  cover={
                    <div className="relative">
                      <img
                        alt={product.ten}
                        src={product.duong_dan_anh || "/placeholder.svg?height=300&width=300"}
                        className="h-64 w-full object-cover"
                      />
                      <Tag color="red" className="absolute top-4 left-4 text-white font-bold text-sm px-3 py-1">
                        -{discountPercent}%
                      </Tag>
                    </div>
                  }
                  onClick={() => handleProductClick(product.id)}
                >
                  <Meta
                    title={<span className="text-lg font-semibold line-clamp-2">{product.ten}</span>}
                    description={
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Text delete className="text-gray-400">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.gia)}
                          </Text>
                        </div>
                        <div>
                          <Text className="text-red-500 font-bold text-xl">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                              discountedPrice,
                            )}
                          </Text>
                        </div>
                        
                      </div>
                    }
                  />
                </Card>
              </Col>
            )
          })}
        </Row>

        <div className="text-center mt-12">
          <Button type="primary" size="large" className="px-8" onClick={() => router.push("/")}>
            Xem tất cả ưu đãi
          </Button>
        </div>
      </div>
    </section>
  )
}
