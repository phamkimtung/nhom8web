"use client"

import { useEffect, useState } from "react"
import { Layout, Typography, Spin } from "antd"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductFilter from "@/components/product-filter"
import ProductList from "@/components/product-list"
import type { Product } from "@/types/product"
import { fetchAllProducts } from "@/lib/api"

const { Content } = Layout
const { Title } = Typography

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    filterProducts(value, null, null, null)
  }

  const handleFilter = (category: string | null, priceRange: [number, number] | null, sortBy: string | null) => {
    filterProducts(searchTerm, category, priceRange, sortBy)
  }

  const filterProducts = (
    search: string,
    category: string | null,
    priceRange: [number, number] | null,
    sortBy: string | null,
  ) => {
    let result = [...products]

    // Lọc theo tìm kiếm
    if (search) {
      result = result.filter((product) => product.ten.toLowerCase().includes(search.toLowerCase()))
    }

    // Lọc theo danh mục
    if (category && category !== "all") {
      result = result.filter((product) => product.danh_muc.toLowerCase() === category.toLowerCase())
    }

    // Lọc theo khoảng giá
    if (priceRange) {
      result = result.filter((product) => product.gia >= priceRange[0] && product.gia <= priceRange[1])
    }

    // Sắp xếp
    if (sortBy) {
      switch (sortBy) {
        case "price_asc":
          result.sort((a, b) => a.gia - b.gia)
          break
        case "price_desc":
          result.sort((a, b) => b.gia - a.gia)
          break
        case "name_asc":
          result.sort((a, b) => a.ten.localeCompare(b.ten))
          break
        case "name_desc":
          result.sort((a, b) => b.ten.localeCompare(a.ten))
          break
        case "newest":
          result.sort((a, b) => new Date(b.tao_luc).getTime() - new Date(a.tao_luc).getTime())
          break
        default:
          break
      }
    }

    setFilteredProducts(result)
  }

  return (
    <Layout className="min-h-screen">
      <Navbar onSearch={handleSearch} />
      <Content className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Title level={2}>Tất cả sản phẩm</Title>
            <p className="text-gray-600">Khám phá bộ sưu tập thời trang đa dạng của chúng tôi</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bộ lọc nằm ngang */}
              <ProductFilter onFilter={handleFilter} totalProducts={filteredProducts.length} />

              {/* Danh sách sản phẩm */}
              <ProductList products={filteredProducts} />
            </div>
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}
