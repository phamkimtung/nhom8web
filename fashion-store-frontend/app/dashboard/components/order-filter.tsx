"use client"
import { Card, Form, Input, Select, DatePicker, Button, Space } from "antd"
import { FilterOutlined, ClearOutlined } from "@ant-design/icons"
import type { Dayjs } from "dayjs"

const { RangePicker } = DatePicker
const { Option } = Select

interface OrderFilterProps {
  onFilter: (filters: OrderFilterValues) => void
}

export interface OrderFilterValues {
  orderId?: string
  status?: string
  dateRange?: [Dayjs, Dayjs] | null
  customerId?: string
}

export default function OrderFilter({ onFilter }: OrderFilterProps) {
  const [form] = Form.useForm()

  const handleFilter = (values: OrderFilterValues) => {
    onFilter(values)
  }

  const handleReset = () => {
    form.resetFields()
    onFilter({})
  }

  return (
    <Card className="mb-4">
      <Form form={form} layout="vertical" onFinish={handleFilter}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Form.Item name="orderId" label="Mã đơn hàng">
            <Input placeholder="Nhập mã đơn hàng" />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select placeholder="Chọn trạng thái" allowClear>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Ngày đặt">
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="customerId" label="Mã khách hàng">
            <Input placeholder="Nhập mã khách hàng" />
          </Form.Item>
        </div>

        <div className="flex justify-end">
          <Space>
            <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
              Lọc
            </Button>
            <Button onClick={handleReset} icon={<ClearOutlined />}>
              Xóa bộ lọc
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  )
}
