"use client"

import { useState } from "react"
import { Card, Typography, Select, InputNumber, Button, Space, Tag, Row, Col, Divider } from "antd"
import { FilterOutlined, ClearOutlined, DownOutlined } from "@ant-design/icons"

const { Title, Text } = Typography
const { Option } = Select

interface ProductFilterProps {
  onFilter: (category: string | null, priceRange: [number, number] | null, sortBy: string | null) => void
  totalProducts: number
}

const categories = [
  { value: "all", label: "Tất cả danh mục" },
  { value: "áo", label: "Áo" },
  { value: "quần", label: "Quần" },
  { value: "váy", label: "Váy" },
  { value: "đầm", label: "Đầm" },
  { value: "giày", label: "Giày" },
  { value: "phụ kiện", label: "Phụ kiện" },
]

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
  { value: "name_asc", label: "Tên: A-Z" },
  { value: "name_desc", label: "Tên: Z-A" },
]

export default function ProductFilter({ onFilter, totalProducts }: ProductFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(5000000)
  const [sortBy, setSortBy] = useState<string>("newest")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onFilter(value === "all" ? null : value, [minPrice, maxPrice], sortBy)
  }

  const handleMinPriceChange = (value: number | null) => {
    const newMinPrice = value || 0
    setMinPrice(newMinPrice)
    onFilter(selectedCategory === "all" ? null : selectedCategory, [newMinPrice, maxPrice], sortBy)
  }

  const handleMaxPriceChange = (value: number | null) => {
    const newMaxPrice = value || 5000000
    setMaxPrice(newMaxPrice)
    onFilter(selectedCategory === "all" ? null : selectedCategory, [minPrice, newMaxPrice], sortBy)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    onFilter(selectedCategory === "all" ? null : selectedCategory, [minPrice, maxPrice], value)
  }

  const handleClearFilters = () => {
    setSelectedCategory("all")
    setMinPrice(0)
    setMaxPrice(5000000)
    setSortBy("newest")
    onFilter(null, null, "newest")
  }

  const handleQuickPriceFilter = (min: number, max: number) => {
    setMinPrice(min)
    setMaxPrice(max)
    onFilter(selectedCategory === "all" ? null : selectedCategory, [min, max], sortBy)
  }

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Hàng đầu tiên: Thông tin kết quả và các bộ lọc chính */}
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6} md={4}>
            <div className="text-center sm:text-left">
              <Text className="text-lg font-semibold text-blue-600">{totalProducts}</Text>
              <Text className="block text-gray-600 text-sm">sản phẩm</Text>
            </div>
          </Col>

          <Col xs={24} sm={6} md={5}>
            <div>
              <Text className="block mb-1 text-sm font-medium">Danh mục</Text>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full"
                suffixIcon={<DownOutlined />}
              >
                {categories.map((category) => (
                  <Option key={category.value} value={category.value}>
                    {category.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={6} md={5}>
            <div>
              <Text className="block mb-1 text-sm font-medium">Sắp xếp</Text>
              <Select value={sortBy} onChange={handleSortChange} className="w-full" suffixIcon={<DownOutlined />}>
                {sortOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={6} md={5}>
            <Space>
              <Button type="default" icon={<FilterOutlined />} onClick={() => setShowAdvanced(!showAdvanced)}>
                Bộ lọc nâng cao
              </Button>
              <Button type="default" icon={<ClearOutlined />} onClick={handleClearFilters}>
                Xóa bộ lọc
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Bộ lọc nâng cao (có thể ẩn/hiện) */}
        {showAdvanced && (
          <>
            <Divider className="my-4" />
            <div className="space-y-4">
              {/* Khoảng giá */}
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={6} md={3}>
                  <Text className="font-medium">Khoảng giá:</Text>
                </Col>
                <Col xs={12} sm={4} md={3}>
                  <div>
                    <Text className="block mb-1 text-xs text-gray-500">Từ</Text>
                    <InputNumber
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      min={0}
                      max={maxPrice}
                      step={100000}
                      className="w-full"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                      placeholder="0"
                      size="small"
                    />
                  </div>
                </Col>
                <Col xs={12} sm={4} md={3}>
                  <div>
                    <Text className="block mb-1 text-xs text-gray-500">Đến</Text>
                    <InputNumber
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      min={minPrice}
                      max={10000000}
                      step={100000}
                      className="w-full"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                      placeholder="5,000,000"
                      size="small"
                    />
                  </div>
                </Col>
                <Col xs={24} sm={10} md={13}>
                  <div>
                    <Text className="block mb-2 text-xs text-gray-500">Lọc nhanh:</Text>
                    <Space wrap>
                      <Tag.CheckableTag
                        checked={minPrice === 0 && maxPrice === 500000}
                        onChange={() => handleQuickPriceFilter(0, 500000)}
                      >
                        Dưới 500K
                      </Tag.CheckableTag>
                      <Tag.CheckableTag
                        checked={minPrice === 500000 && maxPrice === 1000000}
                        onChange={() => handleQuickPriceFilter(500000, 1000000)}
                      >
                        500K - 1M
                      </Tag.CheckableTag>
                      <Tag.CheckableTag
                        checked={minPrice === 1000000 && maxPrice === 2000000}
                        onChange={() => handleQuickPriceFilter(1000000, 2000000)}
                      >
                        1M - 2M
                      </Tag.CheckableTag>
                      <Tag.CheckableTag
                        checked={minPrice === 2000000 && maxPrice === 5000000}
                        onChange={() => handleQuickPriceFilter(2000000, 5000000)}
                      >
                        Trên 2M
                      </Tag.CheckableTag>
                    </Space>
                  </div>
                </Col>
              </Row>

              {/* Hiển thị khoảng giá hiện tại */}
              <Row>
                <Col span={24}>
                  <Text className="text-sm text-gray-600">
                    Khoảng giá hiện tại:{" "}
                    <span className="font-medium text-blue-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(minPrice)}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium text-blue-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(maxPrice)}
                    </span>
                  </Text>
                </Col>
              </Row>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
