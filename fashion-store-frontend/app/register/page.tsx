"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Form, Input, Button, Card, Typography, message, Radio } from "antd"
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons"
import { register } from "@/lib/api"

const { Title } = Typography

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await register(values.ten_dang_nhap, values.email, values.mat_khau, values.vai_tro)
      message.success("Đăng ký thành công! Vui lòng đăng nhập.")
      router.push("/login")
    } catch (error) {
      message.error("Đăng ký thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Title level={2}>Đăng ký tài khoản</Title>
        </div>
        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item name="ten_dang_nhap" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="mat_khau"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item
            name="xac_nhan_mat_khau"
            dependencies={["mat_khau"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("mat_khau") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
          </Form.Item>
          <Form.Item name="vai_tro" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
            <Radio.Group>
              <Radio value="khach_hang">Khách hàng</Radio>
              <Radio value="cua_hang">Cửa hàng</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
          <div className="text-center">
            <p>
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-800">
                Đăng nhập
              </Link>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  )
}
