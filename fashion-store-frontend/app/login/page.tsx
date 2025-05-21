"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Form, Input, Button, Card, Typography, message } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { login } from "@/lib/api"

const { Title } = Typography

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const response = await login(values.ten_dang_nhap, values.mat_khau)

      if (response.token) {
        // Save token and user role to localStorage
        localStorage.setItem("token", response.token)

        // Decode JWT to get user info
        const base64Url = response.token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const payload = JSON.parse(window.atob(base64))

        localStorage.setItem("userId", payload.id)
        localStorage.setItem("userRole", payload.vai_tro)

        message.success("Đăng nhập thành công!")

        // Redirect based on role
        if (payload.vai_tro === "cua_hang") {
          router.push("/dashboard")
        } else {
          router.push("/")
        }
      }
    } catch (error) {
      message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Title level={2}>Đăng nhập</Title>
        </div>
        <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
          <Form.Item name="ten_dang_nhap" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" size="large" />
          </Form.Item>
          <Form.Item name="mat_khau" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
          <div className="text-center">
            <p>
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-800">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  )
}
