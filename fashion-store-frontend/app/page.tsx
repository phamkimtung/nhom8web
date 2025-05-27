"use client"

import { useEffect, useState } from "react"
import { Layout, Typography, Spin } from "antd"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import HeroBanner from "@/components/hero-banner"
import CategorySection from "@/components/category-section"
import ProductGrid from "@/components/product-grid"
import SpecialOffers from "@/components/special-offers"
import CustomerReviews from "@/components/customer-reviews"
import type { Product } from "@/types/product"
import { fetchAllProducts } from "@/lib/api"

const { Content } = Layout
const { Title } = Typography

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchAllProducts()
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = products.filter((product) => product.ten.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  // Lấy 8 sản phẩm mới nhất (sắp xếp theo ngày tạo)
  const latestProducts = products
    .sort((a, b) => new Date(b.tao_luc).getTime() - new Date(a.tao_luc).getTime())
    .slice(0, 8)

  // Lấy sản phẩm giảm giá (giả sử có trường giảm giá hoặc lấy ngẫu nhiên)
  const discountedProducts = products.slice(0, 6)

  return (
    <Layout className="min-h-screen">
      <Navbar onSearch={handleSearch} />
      <Content>
        {/* Banner chính */}
        <HeroBanner />

        {/* Phần 1: Danh mục sản phẩm */}
        <CategorySection />

        {/* Phần 2: Sản phẩm mới nhất */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Title level={2} className="mb-4">
                Sản phẩm mới nhất
              </Title>
              <p className="text-gray-600 text-lg">Khám phá những xu hướng thời trang mới nhất</p>
            </div>
            {loading ? (
              <div className="flex justify-center py-20">
                <Spin size="large" />
              </div>
            ) : (
              <ProductGrid products={searchTerm ? filteredProducts : latestProducts} />
            )}
          </div>
        </section>

        {/* Phần 3: Ưu đãi đặc biệt */}
        <SpecialOffers products={discountedProducts} />

        {/* Phần 4: Đánh giá khách hàng */}
        <CustomerReviews />
      </Content>
      <Footer />
    </Layout>
  )
}
