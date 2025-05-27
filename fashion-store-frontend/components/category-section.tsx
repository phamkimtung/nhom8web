"use client"

import { Row, Col, Card, Typography } from "antd"
import { useRouter } from "next/navigation"
import { ShirtIcon, PantsIcon, DressIcon, ShoesIcon, AccessoryIcon, SkirtIcon } from "@/components/icons/category-icons"

const { Title } = Typography
const { Meta } = Card

const categories = [
  {
    id: "quan",
    name: "Quần",
    icon: <PantsIcon className="w-12 h-12 text-blue-500" />,
    description: "Quần jeans, kaki, short...",
    color: "bg-blue-50 hover:bg-blue-100",
  },
  {
    id: "ao",
    name: "Áo",
    icon: <ShirtIcon className="w-12 h-12 text-green-500" />,
    description: "Áo thun, sơ mi, khoác...",
    color: "bg-green-50 hover:bg-green-100",
  },
  {
    id: "vay",
    name: "Váy",
    icon: <SkirtIcon className="w-12 h-12 text-pink-500" />,
    description: "Váy ngắn, dài, công sở...",
    color: "bg-pink-50 hover:bg-pink-100",
  },
  {
    id: "dam",
    name: "Đầm",
    icon: <DressIcon className="w-12 h-12 text-purple-500" />,
    description: "Đầm dạ hội, công sở...",
    color: "bg-purple-50 hover:bg-purple-100",
  },
  {
    id: "giay",
    name: "Giày",
    icon: <ShoesIcon className="w-12 h-12 text-orange-500" />,
    description: "Giày thể thao, cao gót...",
    color: "bg-orange-50 hover:bg-orange-100",
  },
  {
    id: "phu_kien",
    name: "Phụ kiện",
    icon: <AccessoryIcon className="w-12 h-12 text-red-500" />,
    description: "Túi xách, đồng hồ, trang sức...",
    color: "bg-red-50 hover:bg-red-100",
  },
]

export default function CategorySection() {
  const router = useRouter()

  const handleCategoryClick = (categoryId: string) => {
    // Điều hướng đến trang danh mục hoặc lọc sản phẩm theo danh mục
    router.push(`/?category=${categoryId}`)
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Title level={2} className="mb-4">
            Danh mục sản phẩm
          </Title>
          <p className="text-gray-600 text-lg">Tìm kiếm theo danh mục yêu thích của bạn</p>
        </div>

        <Row gutter={[24, 24]}>
          {categories.map((category) => (
            <Col xs={12} sm={8} md={6} lg={4} key={category.id}>
              <Card
                hoverable
                className={`text-center transition-all duration-300 ${category.color} border-0 shadow-md hover:shadow-lg`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="py-6">
                  <div className="flex justify-center mb-4">{category.icon}</div>
                  <Meta
                    title={<span className="text-lg font-semibold">{category.name}</span>}
                    description={<span className="text-gray-600">{category.description}</span>}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  )
}
