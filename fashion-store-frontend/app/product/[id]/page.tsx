"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Layout,
  Typography,
  Spin,
  Image,
  Button,
  InputNumber,
  Select,
  Descriptions,
  Divider,
  message,
  Card,
} from "antd"
import { ShoppingCartOutlined } from "@ant-design/icons"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import type { Product } from "@/types/product"
import type { Inventory } from "@/types/inventory"
import { fetchProduct, fetchProductInventory, createOrder } from "@/lib/api"

const { Content } = Layout
const { Title, Paragraph } = Typography
const { Option } = Select

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await fetchProduct(Number.parseInt(params.id))
        setProduct(productData)

        const inventoryData = await fetchProductInventory(Number.parseInt(params.id))
        setInventory(inventoryData)
      } catch (error) {
        console.error("Failed to fetch product:", error)
        message.error("Không thể tải thông tin sản phẩm")
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  const handleAddToCart = async () => {
    if (!product || !selectedSize) {
      message.warning("Vui lòng chọn kích cỡ")
      return
    }

    const userId = localStorage.getItem("userId")
    if (!userId) {
      message.warning("Vui lòng đăng nhập để mua hàng")
      router.push("/login")
      return
    }

    try {
      // In a real app, you would add to cart first
      // For demo, we'll create an order directly
      await createOrder({
        nguoi_dung_id: Number.parseInt(userId),
        tong_tien: product.gia * quantity,
        trang_thai: "cho_duyet",
        chi_tiet: [
          {
            san_pham_id: product.id,
            kich_co: selectedSize,
            so_luong: quantity,
            gia: product.gia,
          },
        ],
      })

      message.success("Đặt hàng thành công!")
      router.push("/orders")
    } catch (error) {
      console.error("Failed to add to cart:", error)
      message.error("Không thể thêm vào giỏ hàng")
    }
  }

  const selectedInventoryItem = inventory.find((item) => item.kich_co === selectedSize)
  const isOutOfStock = !selectedInventoryItem || selectedInventoryItem.so_luong <= 0

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

  if (!product) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-4 sm:p-6 lg:p-8">
          <div className="text-center py-20">
            <Title level={3}>Không tìm thấy sản phẩm</Title>
            <Button type="primary" onClick={() => router.push("/")}>
              Quay lại trang chủ
            </Button>
          </div>
        </Content>
        <Footer />
      </Layout>
    )
  }

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-4 sm:p-6 lg:p-8">
        <Card className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Image
                src={product.duong_dan_anh || "/placeholder.svg?height=500&width=500"}
                alt={product.ten}
                width={500}
                height={500}
                className="object-cover rounded"
                fallback="/placeholder.svg?height=500&width=500"
              />
            </div>
            <div>
              <Title level={2}>{product.ten}</Title>
              <Title level={3} type="danger">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.gia)}
              </Title>
              <Divider />
              <Paragraph>{product.mo_ta}</Paragraph>
              <Divider />

              <div className="mb-4">
                <Typography.Text strong>Kích cỡ:</Typography.Text>
                <Select
                  placeholder="Chọn kích cỡ"
                  style={{ width: 200, marginLeft: 16 }}
                  onChange={(value) => setSelectedSize(value)}
                  value={selectedSize || undefined}
                >
                  {inventory.map((item) => (
                    <Option key={item.id} value={item.kich_co} disabled={item.so_luong <= 0}>
                      {item.kich_co} {item.so_luong <= 0 ? "(Hết hàng)" : ""}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="mb-4">
                <Typography.Text strong>Số lượng:</Typography.Text>
                <InputNumber
                  min={1}
                  max={selectedInventoryItem?.so_luong || 1}
                  value={quantity}
                  onChange={(value) => setQuantity(value as number)}
                  style={{ width: 100, marginLeft: 16 }}
                  disabled={isOutOfStock}
                />
              </div>

              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="mt-4"
              >
                Thêm vào giỏ hàng
              </Button>

              {isOutOfStock && (
                <Typography.Text type="danger" className="block mt-2">
                  Sản phẩm đã hết hàng
                </Typography.Text>
              )}
            </div>
          </div>
        </Card>

        <Card title="Thông tin chi tiết">
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Danh mục">{product.danh_muc}</Descriptions.Item>
            <Descriptions.Item label="Mã sản phẩm">{product.id}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Content>
      <Footer />
    </Layout>
  )
}
