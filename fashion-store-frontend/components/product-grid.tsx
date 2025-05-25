"use client"

import { Row, Col, Card, Typography, Rate } from "antd"
import { useRouter } from "next/navigation"
import type { Product } from "@/types/product"

const { Meta } = Card
const { Text } = Typography

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const router = useRouter()

  const handleProductClick = (id: number) => {
    router.push(`/product/${id}`)
  }

  return (
    <Row gutter={[16, 24]}>
      {products.length === 0 ? (
        <Col span={24}>
          <div className="text-center py-12">
            <Text>Không tìm thấy sản phẩm nào.</Text>
          </div>
        </Col>
      ) : (
        products.map((product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              cover={
                <img
                  alt={product.ten}
                  src={product.duong_dan_anh || "/placeholder.svg?height=300&width=300"}
                  className="h-64 object-cover"
                />
              }
              onClick={() => handleProductClick(product.id)}
            >
              <Meta
                title={product.ten}
                description={
                  <div>
                    <Text className="text-red-500 font-bold block">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.gia)}
                    </Text>
                    <Rate disabled defaultValue={4} className="text-sm" />
                  </div>
                }
              />
            </Card>
          </Col>
        ))
      )}
    </Row>
  )
}
