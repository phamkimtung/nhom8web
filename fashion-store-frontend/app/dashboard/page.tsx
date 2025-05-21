"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Layout,
  Typography,
  Spin,
  Card,
  Statistic,
  Row,
  Col,
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
} from "antd"
import {
  ShopOutlined,
  ShoppingOutlined,
  InboxOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import DashboardSidebar from "@/components/dashboard-sidebar"
import type { Product } from "@/types/product"
import type { Inventory } from "@/types/inventory"
import {
  fetchStoreByUserId,
  fetchStoreProducts,
  fetchProductInventory,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductInventory,
  updateInventory,
} from "@/lib/api"

const { Content } = Layout
const { Title } = Typography
const { TabPane } = Tabs
const { Option } = Select

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false)
  const [selectedInventory, setSelectedInventory] = useState<Inventory[]>([])
  const [form] = Form.useForm()
  const [inventoryForm] = Form.useForm()

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    const userRole = localStorage.getItem("userRole")

    if (!userId || userRole !== "cua_hang") {
      message.warning("Bạn không có quyền truy cập trang này")
      router.push("/login")
      return
    }

    const loadStoreData = async () => {
      try {
        const storeData = await fetchStoreByUserId(Number.parseInt(userId))
        if (storeData && storeData.length > 0) {
          setStoreId(storeData[0].id)
          const productsData = await fetchStoreProducts(storeData[0].id)
          setProducts(productsData)
        } else {
          message.warning("Bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước.")
          // In a real app, you would redirect to store creation page
        }
      } catch (error) {
        console.error("Failed to fetch store data:", error)
        message.error("Không thể tải dữ liệu cửa hàng")
      } finally {
        setLoading(false)
      }
    }

    loadStoreData()
  }, [router])

  const showModal = (product: Product | null = null) => {
    setSelectedProduct(product)
    if (product) {
      form.setFieldsValue({
        ten: product.ten,
        mo_ta: product.mo_ta,
        gia: product.gia,
        danh_muc: product.danh_muc,
        duong_dan_anh: product.duong_dan_anh,
      })
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const showInventoryModal = async (productId: number) => {
    try {
      const inventoryData = await fetchProductInventory(productId)
      setSelectedInventory(inventoryData)
      setSelectedProduct(products.find((p) => p.id === productId) || null)
      setIsInventoryModalVisible(true)
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
      message.error("Không thể tải dữ liệu tồn kho")
    }
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (selectedProduct) {
        // Update existing product
        await updateProduct(selectedProduct.id, values)
        message.success("Cập nhật sản phẩm thành công")

        // Update local state
        setProducts(products.map((p) => (p.id === selectedProduct.id ? { ...p, ...values } : p)))
      } else if (storeId) {
        // Create new product
        const newProduct = await createProduct({
          ...values,
          cua_hang_id: storeId,
        })
        message.success("Thêm sản phẩm thành công")

        // Update local state
        setProducts([...products, newProduct])
      }
      setIsModalVisible(false)
    } catch (error) {
      console.error("Form validation failed:", error)
    }
  }

  const handleInventoryOk = async () => {
    try {
      const values = await inventoryForm.validateFields()
      if (selectedProduct) {
        // Check if size already exists
        const existingInventory = selectedInventory.find((inv) => inv.kich_co === values.kich_co)

        if (existingInventory) {
          // Update existing inventory
          await updateInventory(existingInventory.id, values.so_luong)
          message.success("Cập nhật tồn kho thành công")

          // Update local state
          setSelectedInventory(
            selectedInventory.map((inv) =>
              inv.id === existingInventory.id ? { ...inv, so_luong: values.so_luong } : inv,
            ),
          )
        } else {
          // Add new inventory
          const newInventory = await addProductInventory(selectedProduct.id, values.kich_co, values.so_luong)
          message.success("Thêm kích cỡ mới thành công")

          // Update local state
          setSelectedInventory([...selectedInventory, newInventory])
        }
      }
      inventoryForm.resetFields()
    } catch (error) {
      console.error("Form validation failed:", error)
    }
  }

  const handleDelete = async (productId: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteProduct(productId)
          message.success("Xóa sản phẩm thành công")

          // Update local state
          setProducts(products.filter((p) => p.id !== productId))
        } catch (error) {
          console.error("Failed to delete product:", error)
          message.error("Không thể xóa sản phẩm")
        }
      },
    })
  }

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
      title: "Giá",
      dataIndex: "gia",
      key: "gia",
      render: (price: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Product) => (
        <div className="space-x-2">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Sửa
          </Button>
          <Button icon={<InboxOutlined />} onClick={() => showInventoryModal(record.id)}>
            Tồn kho
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ]

  const inventoryColumns = [
    {
      title: "Kích cỡ",
      dataIndex: "kich_co",
      key: "kich_co",
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      key: "so_luong",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Inventory) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            inventoryForm.setFieldsValue({
              kich_co: record.kich_co,
              so_luong: record.so_luong,
            })
          }}
        >
          Cập nhật
        </Button>
      ),
    },
  ]

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Content className="p-4 sm:p-6 lg:p-8 flex justify-center items-center">
          <Spin size="large" />
        </Content>
      </Layout>
    )
  }

  return (
    <Layout className="min-h-screen">
      <DashboardSidebar />
      <Layout className="site-layout">
        <Content className="p-4 sm:p-6 lg:p-8">
          <Title level={2}>Quản lý cửa hàng</Title>

          <Row gutter={16} className="mb-8">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic title="Tổng sản phẩm" value={products.length} prefix={<ShopOutlined />} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Đơn hàng mới"
                  value={0} // In a real app, you would fetch this data
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Sản phẩm hết hàng"
                  value={0} // In a real app, you would calculate this
                  prefix={<InboxOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title="Danh sách sản phẩm"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                Thêm sản phẩm
              </Button>
            }
          >
            <Table
              columns={productColumns}
              dataSource={products.map((product) => ({ ...product, key: product.id }))}
              pagination={{ pageSize: 10 }}
              responsive={true}
            />
          </Card>

          {/* Product Modal */}
          <Modal
            title={selectedProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
            open={isModalVisible}
            onOk={handleOk}
            onCancel={() => setIsModalVisible(false)}
            width={800}
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
              <Form.Item name="gia" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
                <InputNumber
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item
                name="danh_muc"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select>
                  <Option value="áo">Áo</Option>
                  <Option value="quần">Quần</Option>
                  <Option value="váy">Váy</Option>
                  <Option value="đầm">Đầm</Option>
                  <Option value="giày">Giày</Option>
                  <Option value="phụ kiện">Phụ kiện</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="duong_dan_anh"
                label="Đường dẫn ảnh"
                rules={[{ required: true, message: "Vui lòng nhập đường dẫn ảnh" }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>

          {/* Inventory Modal */}
          <Modal
            title={`Quản lý tồn kho: ${selectedProduct?.ten || ""}`}
            open={isInventoryModalVisible}
            onCancel={() => setIsInventoryModalVisible(false)}
            footer={null}
            width={800}
          >
            <Tabs defaultActiveKey="1">
              <TabPane tab="Danh sách tồn kho" key="1">
                <Table
                  columns={inventoryColumns}
                  dataSource={selectedInventory.map((inv) => ({ ...inv, key: inv.id }))}
                  pagination={false}
                />
              </TabPane>
              <TabPane tab="Thêm/Cập nhật tồn kho" key="2">
                <Form form={inventoryForm} layout="vertical" onFinish={handleInventoryOk}>
                  <Form.Item
                    name="kich_co"
                    label="Kích cỡ"
                    rules={[{ required: true, message: "Vui lòng chọn kích cỡ" }]}
                  >
                    <Select>
                      <Option value="S">S</Option>
                      <Option value="M">M</Option>
                      <Option value="L">L</Option>
                      <Option value="XL">XL</Option>
                      <Option value="XXL">XXL</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="so_luong"
                    label="Số lượng"
                    rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Lưu
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  )
}
