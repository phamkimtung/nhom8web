"use client"

import { useEffect, useState } from "react"
import { Layout, Typography, Input, Spin, Empty, Select, Pagination } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { API_URL, PRODUCT_CATEGORIES } from "@/lib/config"
import { MessageContainer, useMessage } from "@/lib/message-utils"

const { Content } = Layout
const { Title } = Typography
const { Search } = Input
const { Option } = Select

interface Product {
  id: number
  ten: string
  mo_ta: string
  gia: number
  danh_muc: string
  duong_dan_anh: string
}

export default function ProductsPage() {
  const { message } = useMessage()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("default")
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const pageSize = 12

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`)

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Lọc và sắp xếp sản phẩm khi có thay đổi
  useEffect(() => {
    let result = [...products]

    // Lọc theo tên
    if (searchTerm) {
      result = result.filter((product) => product.ten.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Lọc theo danh mục
    if (category) {
      result = result.filter((product) => product.danh_muc === category)
    }

    // Sắp xếp
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.gia - b.gia)
        break
      case "price-desc":
        result.sort((a, b) => b.gia - a.gia)
        break
      case "name-asc":
        result.sort((a, b) => a.ten.localeCompare(b.ten))
        break
      case "name-desc":
        result.sort((a, b) => b.ten.localeCompare(a.ten))
        break
      default:
        // Giữ nguyên thứ tự
        break
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Reset về trang đầu tiên khi lọc
  }, [products, searchTerm, category, sortBy])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Phân trang
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-4 sm:p-6 lg:p-8 flex justify-center items-center">
          <Spin size="large" />
        </Content>
        <Footer />
      </Layout>
    )
  }

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <MessageContainer />
      <Content className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <Title level={2} className="mb-6">
            Tất cả sản phẩm
          </Title>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              className="md:w-1/2"
            />

            <div className="flex flex-1 gap-4">
              <Select
                placeholder="Danh mục"
                allowClear
                style={{ width: "100%" }}
                onChange={handleCategoryChange}
                size="large"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>

              <Select
                placeholder="Sắp xếp theo"
                style={{ width: "100%" }}
                onChange={handleSortChange}
                size="large"
                defaultValue="default"
              >
                <Option value="default">Mặc định</Option>
                <Option value="price-asc">Giá: Thấp đến cao</Option>
                <Option value="price-desc">Giá: Cao đến thấp</Option>
                <Option value="name-asc">Tên: A-Z</Option>
                <Option value="name-desc">Tên: Z-A</Option>
              </Select>
            </div>
          </div>

          {error ? (
            <Empty description={error} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : filteredProducts.length === 0 ? (
            <Empty description="Không tìm thấy sản phẩm nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Pagination
                  current={currentPage}
                  total={filteredProducts.length}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}
