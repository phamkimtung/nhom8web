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
  Modal,
  Upload,
  Space,
} from "antd"
import { ShoppingCartOutlined, CameraOutlined, UploadOutlined, LoadingOutlined } from "@ant-design/icons"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import type { Product } from "@/types/product"
import type { Inventory } from "@/types/inventory"
import { fetchProduct, fetchProductInventory, createOrder, tryOnClothes } from "@/lib/api"
import ProductReviews from "@/components/product-reviews"
import type { RcFile } from "antd/es/upload/interface"

const { Content } = Layout
const { Title, Paragraph, Text } = Typography
const { Option } = Select

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)

  // Try-on states
  const [tryOnModalVisible, setTryOnModalVisible] = useState(false)
  const [userImage, setUserImage] = useState<RcFile | null>(null)
  const [userImageUrl, setUserImageUrl] = useState<string>("")
  const [tryOnLoading, setTryOnLoading] = useState(false)
  const [tryOnResult, setTryOnResult] = useState<string>("")

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

  const handleTryOn = () => {
    setTryOnModalVisible(true)
    setTryOnResult("")
    setUserImage(null)
    setUserImageUrl("")
  }

  const handleImageUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/")
    if (!isImage) {
      message.error("Bạn chỉ có thể tải lên file hình ảnh!")
      return false
    }

    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error("Hình ảnh phải nhỏ hơn 5MB!")
      return false
    }

    setUserImage(file)

    // Generate preview URL
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setUserImageUrl(reader.result as string)
    }

    return false // Prevent auto upload
  }

  const handleProcessTryOn = async () => {
    if (!userImage || !product) {
      message.warning("Vui lòng chọn ảnh của bạn")
      return
    }

    setTryOnLoading(true)
    try {
      const result = await tryOnClothes(userImage, product.duong_dan_anh || "", `${product.ten} - ${product.danh_muc}`)

      setTryOnResult(result.imageUrl) // Sử dụng outputImage từ Replicate
      message.success("Thử đồ thành công!")
    } catch (error) {
      console.error("Failed to process try-on:", error)
      message.error("Không thể xử lý thử đồ. Vui lòng thử lại.")
    } finally {
      setTryOnLoading(false)
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

              <Space direction="vertical" size="middle" className="w-full">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  block
                >
                  Thêm vào giỏ hàng
                </Button>

                <Button
                  type="default"
                  size="large"
                  icon={<CameraOutlined />}
                  onClick={handleTryOn}
                  block
                  className="border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  Thử đồ ảo
                </Button>
              </Space>

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

        <ProductReviews productId={product.id} averageRating={product.danh_gia_trung_binh || 0} />

        {/* Try-on Modal */}
        <Modal
          title="Thử đồ ảo"
          open={tryOnModalVisible}
          onCancel={() => setTryOnModalVisible(false)}
          width={800}
          footer={null}
        >
          <div className="space-y-6">
            <div className="text-center">
              <Text className="text-gray-600">
                Tải lên ảnh của bạn để xem bạn trông như thế nào khi mặc sản phẩm này
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div>
                <Title level={5}>Ảnh của bạn</Title>
                <Upload.Dragger
                  name="userImage"
                  listType="picture"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  className="mb-4"
                >
                  {userImageUrl ? (
                    <img
                      src={userImageUrl || "/placeholder.svg"}
                      alt="User"
                      style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="p-6">
                      <UploadOutlined className="text-4xl text-gray-400 mb-4" />
                      <p className="text-lg">Nhấn hoặc kéo ảnh vào đây</p>
                      <p className="text-gray-500">Hỗ trợ: JPG, PNG (tối đa 5MB)</p>
                    </div>
                  )}
                </Upload.Dragger>

                {userImage && (
                  <Button
                    type="primary"
                    onClick={handleProcessTryOn}
                    loading={tryOnLoading}
                    icon={tryOnLoading ? <LoadingOutlined /> : <CameraOutlined />}
                    block
                    size="large"
                  >
                    {tryOnLoading ? "Đang xử lý..." : "Thử đồ ngay"}
                  </Button>
                )}
              </div>

              {/* Result Section */}
              <div>
                <Title level={5}>Kết quả</Title>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                  {tryOnLoading ? (
                    <div className="text-center">
                      <Spin size="large" />
                      <p className="mt-4 text-gray-600">Đang xử lý ảnh, vui lòng đợi...</p>
                    </div>
                  ) : tryOnResult ? (
                    <div className="text-center">
                      <img
                        src={tryOnResult || "/placeholder.svg"}
                        alt="Try-on result"
                        style={{ width: "100%", maxHeight: "400px", objectFit: "cover" }}
                        className="rounded-lg"
                      />
                      <p className="mt-2 text-green-600">Thử đồ thành công!</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <CameraOutlined className="text-4xl mb-4" />
                      <p>Kết quả thử đồ sẽ hiển thị ở đây</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Text className="text-sm text-gray-500">
                💡 Mẹo: Sử dụng ảnh chụp toàn thân, đứng thẳng và có ánh sáng tốt để có kết quả tốt nhất
              </Text>
            </div>
          </div>
        </Modal>
      </Content>
      <Footer />
    </Layout>
  )
}
