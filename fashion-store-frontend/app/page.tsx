"use client"

import { useEffect, useState } from "react"
import { Layout, Typography, Spin } from "antd"
import Navbar from "@/components/navbar"
import ProductGrid from "@/components/product-grid"
import Footer from "@/components/footer"
import HeroBanner from "@/components/hero-banner"
import type { Product } from "@/types/product"
import { fetchProducts } from "@/lib/api"

const { Content } = Layout
const { Title } = Typography

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // In a real app, you would fetch from all stores
        // For demo purposes, we'll fetch from store ID 1
        const data = await fetchProducts(1)
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
    // In a real app, you would also save search history to the backend
  }

  return (
    <Layout className="min-h-screen">
      <Navbar onSearch={handleSearch} />
      <Content className="px-4 sm:px-6 lg:px-8">
        <HeroBanner />
        <div className="py-8">
          <Title level={2} className="text-center mb-8">
            Sản phẩm mới nhất
          </Title>
          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}
