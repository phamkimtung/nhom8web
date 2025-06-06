"use client"

import { useState } from "react"
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, App, Upload } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined, UploadOutlined } from "@ant-design/icons"
import type { ProductWithInventory } from "../hooks/use-dashboard-data"
import InventoryForm from "./inventory-form"
import type { Product } from "@/types/product"
import type { RcFile } from "antd/es/upload/interface"
import { createProduct } from "@/lib/api"

const { Option } = Select

interface DashboardProductsProps {
  storeId: number | null
  products: ProductWithInventory[]
  updateProduct: (productId: number, productData: Partial<Product>) => Promise<boolean>
  deleteProduct: (productId: number) => Promise<boolean>
  updateInventory: (
    productId: number,
    inventoryId: number | null,
    kich_co: string,
    so_luong: number,
  ) => Promise<boolean>
}

export default function DashboardProducts({
  storeId,
  products,
  updateProduct,
  deleteProduct,
  updateInventory,
}: DashboardProductsProps) {
  const { message } = App.useApp()
  const [selectedProduct, setSelectedProduct] = useState<ProductWithInventory | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [imageFile, setImageFile] = useState<RcFile | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  // Xử lý sản phẩm
  const showModal = (product: ProductWithInventory | null = null) => {
    setSelectedProduct(product)
    if (product) {
      form.setFieldsValue({
        ten: product.ten,
        mo_ta: product.mo_ta,
        gia: product.gia,
        danh_muc: product.danh_muc,
        duong_dan_anh: product.duong_dan_anh,
        mo_ta_ai_thu_do: product.mo_ta_ai_thu_do, // Thêm dòng này
      })
      setImageUrl(product.duong_dan_anh || "")
    } else {
      form.resetFields()
      setImageUrl("")
    }
    setImageFile(null)
    setIsModalVisible(true)
  }

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) {
      return imageUrl // Return existing URL if no new file
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await fetch("http://localhost:3000/api/images/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      setUploading(false)
      return data.imageUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploading(false)
      throw error
    }
  }

  const addNewProduct = async (productData: any) => {
    if (!storeId) {
      message.error("Không tìm thấy thông tin cửa hàng")
      return null
    }

    try {
      const newProduct = await createProduct({
        ...productData,
        cua_hang_id: storeId,
      })

      message.success("Thêm sản phẩm thành công")

      // Reload the page to refresh the product list
      window.location.reload()

      return newProduct
    } catch (error) {
      console.error("Failed to add product:", error)
      message.error("Không thể thêm sản phẩm")
      return null
    }
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      try {
        // Upload image if there's a new file
        if (imageFile) {
          const uploadedImageUrl = await uploadImage()
          values.duong_dan_anh = uploadedImageUrl
        }

        if (selectedProduct) {
          // Cập nhật sản phẩm hiện có
          await updateProduct(selectedProduct.id, values)
        } else if (storeId) {
          // Tạo sản phẩm mới
          await addNewProduct(values)
        }
        setIsModalVisible(false)
      } catch (error) {
        message.error("Không thể tải lên hình ảnh hoặc lưu sản phẩm")
      }
    } catch (error) {
      console.error("Form validation failed:", error)
    }
  }

  const handleDelete = (productId: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => deleteProduct(productId),
    })
  }

  // Xử lý tồn kho
  const showInventoryModal = (product: ProductWithInventory) => {
    setSelectedProduct(product)
    setIsInventoryModalVisible(true)
  }

  // Xử lý upload ảnh
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/")
    if (!isImage) {
      message.error("Bạn chỉ có thể tải lên file hình ảnh!")
      return false
    }

    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error("Hình ảnh phải nhỏ hơn 2MB!")
      return false
    }

    setImageFile(file)
    // Generate preview URL
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setImageUrl(reader.result as string)
    }

    // Return false to prevent auto upload
    return false
  }

  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  )

  // Columns cho bảng sản phẩm
  const productColumns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "ten",
      key: "ten",
    },
    {
      title: "Danh mục",
      dataIndex: "danh_muc",
      key: "danh_muc",
    },
    {
      title: "Mô tả AI thử đồ",
      dataIndex: "mo_ta_ai_thu_do",
      key: "mo_ta_ai_thu_do",
      render: (text: string) => (
        <div className="max-w-xs">
          {text ? (
            <span className="text-gray-700">{text}</span>
          ) : (
            <span className="text-gray-400 italic">Chưa có mô tả</span>
          )}
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "gia",
      key: "gia",
      render: (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price),
    },
    {
      title: "Hình ảnh",
      key: "image",
      render: (_: any, record: ProductWithInventory) => (
        <div className="w-16 h-16 overflow-hidden">
          <img
            src={record.duong_dan_anh || "/placeholder.svg?height=64&width=64"}
            alt={record.ten}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=64&width=64"
            }}
          />
        </div>
      ),
    },
    {
      title: "Tồn kho",
      key: "totalStock",
      render: (_: any, record: ProductWithInventory) => {
        const totalStock = record.totalStock || 0
        let color = "green"
        if (totalStock <= 5) {
          color = "red"
        } else if (totalStock <= 20) {
          color = "orange"
        }
        return <Tag color={color}>{totalStock}</Tag>
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ProductWithInventory) => (
        <div className="space-x-2">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Button icon={<InboxOutlined />} onClick={() => showInventoryModal(record)}>
            Tồn kho
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm sản phẩm
        </Button>
      </div>
      <Card>
        <Table
          columns={productColumns}
          dataSource={products.map((product) => ({ ...product, key: product.id }))}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal sản phẩm */}
      <Modal
        title={selectedProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="ten"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="mo_ta" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="mo_ta_ai_thu_do" label="Mô tả AI thử đồ">
            <Input.TextArea
              rows={3}
              placeholder="Mô tả chi tiết về sản phẩm để AI thử đồ hoạt động tốt hơn (ví dụ: áo sơ mi nam màu xanh, chất liệu cotton...)"
            />
          </Form.Item>

          <Form.Item name="gia" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
            <InputNumber
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="danh_muc" label="Danh mục" rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}>
            <Select>
              <Option value="áo">Áo</Option>
              <Option value="quần">Quần</Option>
              <Option value="váy">Váy</Option>
              <Option value="đầm">Đầm</Option>
              <Option value="giày">Giày</Option>
              <Option value="phụ kiện">Phụ kiện</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Hình ảnh sản phẩm" rules={[{ required: true, message: "Vui lòng tải lên hình ảnh" }]}>
            <Upload
              name="image"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              maxCount={1}
            >
              {imageUrl ? (
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="product"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                uploadButton
              )}
            </Upload>

            {imageFile && (
              <div className="text-sm text-gray-500 mt-2">
                File: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal tồn kho */}
      <InventoryForm
        visible={isInventoryModalVisible}
        onCancel={() => setIsInventoryModalVisible(false)}
        product={selectedProduct}
        updateInventory={updateInventory}
      />
    </>
  )
}
