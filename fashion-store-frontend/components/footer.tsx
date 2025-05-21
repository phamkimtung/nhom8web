import { Layout, Row, Col, Typography, Space, Divider } from "antd"
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons"

const { Footer: AntFooter } = Layout
const { Title, Text, Link } = Typography

export default function Footer() {
  return (
    <AntFooter className="bg-gray-100 pt-8 pb-4">
      <div className="max-w-7xl mx-auto">
        <Row gutter={[32, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Title level={4} className="mb-4">
              Fashion Store
            </Title>
            <Text className="block mb-4">
              Chúng tôi cung cấp các sản phẩm thời trang chất lượng cao với giá cả phải chăng.
            </Text>
            <Space>
              <Link href="#" target="_blank">
                <FacebookOutlined className="text-2xl" />
              </Link>
              <Link href="#" target="_blank">
                <InstagramOutlined className="text-2xl" />
              </Link>
              <Link href="#" target="_blank">
                <TwitterOutlined className="text-2xl" />
              </Link>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Title level={4} className="mb-4">
              Liên kết nhanh
            </Title>
            <ul className="list-none p-0">
              <li className="mb-2">
                <Link href="/">Trang chủ</Link>
              </li>
              <li className="mb-2">
                <Link href="/">Sản phẩm</Link>
              </li>
              <li className="mb-2">
                <Link href="/">Về chúng tôi</Link>
              </li>
              <li className="mb-2">
                <Link href="/">Liên hệ</Link>
              </li>
              <li className="mb-2">
                <Link href="/">Chính sách bảo mật</Link>
              </li>
            </ul>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Title level={4} className="mb-4">
              Liên hệ
            </Title>
            <ul className="list-none p-0">
              <li className="mb-2 flex items-center">
                <HomeOutlined className="mr-2" /> 123 Đường ABC, Quận XYZ, TP. HCM
              </li>
              <li className="mb-2 flex items-center">
                <PhoneOutlined className="mr-2" /> +84 123 456 789
              </li>
              <li className="mb-2 flex items-center">
                <MailOutlined className="mr-2" /> info@fashionstore.com
              </li>
            </ul>
          </Col>
        </Row>

        <Divider className="my-4" />

        <div className="text-center">
          <Text type="secondary">© {new Date().getFullYear()} Fashion Store. Tất cả quyền được bảo lưu.</Text>
        </div>
      </div>
    </AntFooter>
  )
}
