"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Layout, Typography, Steps, Button, Form, Input, Select, Radio, List, Card, Result } from "antd"
import { ShoppingOutlined, CreditCardOutlined, CheckCircleOutlined } from "@ant-design/icons"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/contexts/cart-context"
import { getAuthData } from "@/lib/auth"
import { createOrder } from "@/lib/api"
import { MessageContainer, useMessage } from "@/lib/message-utils"

const { Content } = Layout
const { Title, Text } = Typography
const { Step } = Steps
const { Option } = Select
const { TextArea } = Input

export default function Checkout() {
  const router = useRouter()
  const { message } = useMessage()
  const { items, totalPrice, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    // Kiểm tra xác thực
    const { token } = getAuthData()
    if (!token) {
      if (message) message.warning("Vui lòng đăng nhập để thanh toán")
      router.push("/login")
      return
    }

    // Kiểm tra giỏ hàng
    if (items.length === 0 && !orderComplete) {
      if (message) message.warning("Giỏ hàng của bạn đang trống")
      router.push("/products")
    }
  }, [items, router, message, orderComplete])

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1)
    })
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const { userId } = getAuthData()
      if (!userId) {
        throw new Error("User not logged in")
      }

      // Tạo đơn hàng
      await createOrder({
        nguoi_dung_id: userId,
        tong_tien: totalPrice,
        trang_thai: "cho_duyet",
        dia_chi_giao_hang: `${values.address}, ${values.district}, ${values.city}`,
        so_dien_thoai: values.phone,
        ghi_chu: values.note,
        phuong_thuc_thanh_toan: values.paymentMethod,
        chi_tiet: items.map((item) => ({
          san_pham_id: item.id,
          kich_co: item.kich_co,
          so_luong: item.so_luong,
          gia: item.gia,
        })),
      })

      // Xóa giỏ hàng sau khi đặt hàng thành công
      clearCart()
      setOrderComplete(true)
      setCurrentStep(currentStep + 1)
      if (message) message.success("Đặt hàng thành công!")
    } catch (error) {
      console.error("Checkout error:", error)
      if (message) message.error("Đặt hàng thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: "Thông tin giao hàng",
      content: (
        <Form form={form} layout="vertical" initialValues={{ paymentMethod: "cod" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
              <Input size="large" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="city"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
            >
              <Select size="large" placeholder="Chọn tỉnh/thành phố">
                <Option value="hanoi">Hà Nội</Option>
                <Option value="hcm">TP. Hồ Chí Minh</Option>
                <Option value="danang">Đà Nẵng</Option>
                {/* Thêm các tỉnh/thành phố khác */}
              </Select>
            </Form.Item>

            <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
            >
              <Select size="large" placeholder="Chọn quận/huyện">
                <Option value="district1">Quận 1</Option>
                <Option value="district2">Quận 2</Option>
                <Option value="district3">Quận 3</Option>
                {/* Thêm các quận/huyện khác */}
              </Select>
            </Form.Item>

            <Form.Item name="ward" label="Phường/Xã" rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}>
              <Select size="large" placeholder="Chọn phường/xã">
                <Option value="ward1">Phường 1</Option>
                <Option value="ward2">Phường 2</Option>
                <Option value="ward3">Phường 3</Option>
                {/* Thêm các phường/xã khác */}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Địa chỉ cụ thể"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "Phương thức thanh toán",
      content: (
        <Form form={form} layout="vertical">
          <Form.Item
            name="paymentMethod"
            label="Chọn phương thức thanh toán"
            rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán" }]}
          >
            <Radio.Group>
              <div className="space-y-4">
                <Radio value="cod" className="p-4 border rounded-md w-full flex items-start">
                  <div>
                    <Text strong className="block">
                      Thanh toán khi nhận hàng (COD)
                    </Text>
                    <Text type="secondary">Thanh toán bằng tiền mặt khi nhận hàng</Text>
                  </div>
                </Radio>

                <Radio value="bank_transfer" className="p-4 border rounded-md w-full flex items-start">
                  <div>
                    <Text strong className="block">
                      Chuyển khoản ngân hàng
                    </Text>
                    <Text type="secondary">Thông tin tài khoản sẽ được gửi qua email</Text>
                  </div>
                </Radio>

                <Radio value="momo" className="p-4 border rounded-md w-full flex items-start">
                  <div>
                    <Text strong className="block">
                      Ví MoMo
                    </Text>
                    <Text type="secondary">Thanh toán qua ví điện tử MoMo</Text>
                  </div>
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "Xác nhận đơn hàng",
      content: (
        <div>
          <Card title="Thông tin đơn hàng" className="mb-6">
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <img
                        src={item.duong_dan_anh || "/placeholder.svg?height=80&width=80"}
                        alt={item.ten}
                        className="w-16 h-16 object-cover"
                      />
                    }
                    title={item.ten}
                    description={`Kích cỡ: ${item.kich_co} | Số lượng: ${item.so_luong}`}
                  />
                  <div>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      item.gia * item.so_luong,
                    )}
                  </div>
                </List.Item>
              )}
              footer={
                <div className="flex justify-between">
                  <Text strong>Tổng tiền:</Text>
                  <Text strong className="text-red-500 text-lg">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
                  </Text>
                </div>
              }
            />
          </Card>

          <Card title="Thông tin giao hàng">
            <Form.Item noStyle shouldUpdate>
              {() => (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>Họ tên:</Text>
                    <Text strong>{form.getFieldValue("fullName")}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Số điện thoại:</Text>
                    <Text strong>{form.getFieldValue("phone")}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Địa chỉ:</Text>
                    <Text strong>
                      {form.getFieldValue("address")}, {form.getFieldValue("ward")}, {form.getFieldValue("district")},{" "}
                      {form.getFieldValue("city")}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Phương thức thanh toán:</Text>
                    <Text strong>
                      {form.getFieldValue("paymentMethod") === "cod" && "Thanh toán khi nhận hàng"}
                      {form.getFieldValue("paymentMethod") === "bank_transfer" && "Chuyển khoản ngân hàng"}
                      {form.getFieldValue("paymentMethod") === "momo" && "Ví MoMo"}
                    </Text>
                  </div>
                  {form.getFieldValue("note") && (
                    <div className="flex justify-between">
                      <Text>Ghi chú:</Text>
                      <Text>{form.getFieldValue("note")}</Text>
                    </div>
                  )}
                </div>
              )}
            </Form.Item>
          </Card>
        </div>
      ),
    },
    {
      title: "Hoàn tất",
      content: (
        <Result
          status="success"
          title="Đặt hàng thành công!"
          subTitle="Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý."
          extra={[
            <Button type="primary" key="orders" onClick={() => router.push("/orders")}>
              Xem đơn hàng
            </Button>,
            <Button key="buy" onClick={() => router.push("/products")}>
              Tiếp tục mua sắm
            </Button>,
          ]}
        />
      ),
    },
  ]

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <MessageContainer />
      <Content className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Title level={2} className="mb-6">
            Thanh toán
          </Title>

          <Steps current={currentStep} className="mb-8">
            <Step title="Thông tin giao hàng" icon={<ShoppingOutlined />} />
            <Step title="Phương thức thanh toán" icon={<CreditCardOutlined />} />
            <Step title="Xác nhận đơn hàng" icon={<ShoppingOutlined />} />
            <Step title="Hoàn tất" icon={<CheckCircleOutlined />} />
          </Steps>

          <div className="mb-8">{steps[currentStep].content}</div>

          <div className="flex justify-between">
            {currentStep > 0 && currentStep < 3 && <Button onClick={prevStep}>Quay lại</Button>}

            {currentStep < 2 ? (
              <Button type="primary" onClick={nextStep}>
                Tiếp tục
              </Button>
            ) : currentStep === 2 ? (
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                Đặt hàng
              </Button>
            ) : null}
          </div>
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}
