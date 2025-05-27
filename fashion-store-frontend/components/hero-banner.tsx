"use client"

import { Button, Typography } from "antd"
import { useRouter } from "next/navigation"

const { Title, Paragraph } = Typography

export default function HeroBanner() {
  const router = useRouter()

  return (
    <div className="relative">
      <div
        className="h-[600px] flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage: "url('/banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <Title level={1} className="text-white mb-6 text-4xl md:text-6xl font-bold">
            Bộ sưu tập thời trang 2025
          </Title>
          <Paragraph className="text-xl md:text-2xl mb-8 text-gray-200">
            Khám phá phong cách thời trang hiện đại với chất lượng cao và giá cả hợp lý
          </Paragraph>
          <Button
            type="primary"
            size="large"
            className="h-14 px-8 text-lg font-semibold"
            onClick={() => router.push("/")}
          >
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
