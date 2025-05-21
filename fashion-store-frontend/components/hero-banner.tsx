"use client"

import { Carousel, Button, Typography } from "antd"
import { useRouter } from "next/navigation"

const { Title, Paragraph } = Typography

export default function HeroBanner() {
  const router = useRouter()

  return (
    <Carousel autoplay className="mb-8">
      <div>
        <div
          className="h-96 flex items-center justify-center bg-cover bg-center relative"
          style={{
            backgroundImage: "url('/placeholder.svg?height=600&width=1200')",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 text-center text-white px-4">
            <Title level={1} className="text-white mb-4">
              Bộ sưu tập mùa hè 2025
            </Title>
            <Paragraph className="text-lg mb-6">Khám phá các xu hướng thời trang mới nhất với giá ưu đãi</Paragraph>
            <Button type="primary" size="large" onClick={() => router.push("/")}>
              Mua sắm ngay
            </Button>
          </div>
        </div>
      </div>
      <div>
        <div
          className="h-96 flex items-center justify-center bg-cover bg-center relative"
          style={{
            backgroundImage: "url('/placeholder.svg?height=600&width=1200')",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative z-10 text-center text-white px-4">
            <Title level={1} className="text-white mb-4">
              Giảm giá lên đến 50%
            </Title>
            <Paragraph className="text-lg mb-6">Ưu đãi đặc biệt cho khách hàng mới</Paragraph>
            <Button type="primary" size="large" onClick={() => router.push("/")}>
              Xem ngay
            </Button>
          </div>
        </div>
      </div>
    </Carousel>
  )
}
