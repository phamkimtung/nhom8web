"use client"

import { useState } from "react"
import { Modal, Tabs, Table, Form, Select, InputNumber, Button } from "antd"
import { EditOutlined } from "@ant-design/icons"
import type { ProductWithInventory } from "../hooks/use-dashboard-data"
import type { Inventory } from "@/types/inventory"

const { Option } = Select

interface InventoryFormProps {
  visible: boolean
  onCancel: () => void
  product: ProductWithInventory | null
  updateInventory: (
    productId: number,
    inventoryId: number | null,
    kich_co: string,
    so_luong: number,
  ) => Promise<boolean>
}

export default function InventoryForm({ visible, onCancel, product, updateInventory }: InventoryFormProps) {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState("1")

  if (!product) {
    return null
  }

  const handleInventorySubmit = async () => {
    try {
      const values = await form.validateFields()
      const { kich_co, so_luong } = values

      // Kiểm tra kích cỡ đã tồn tại chưa
      const existingInventory = product.inventory.find((inv) => inv.kich_co === kich_co)

      if (existingInventory) {
        await updateInventory(product.id, existingInventory.id, kich_co, so_luong)
      } else {
        await updateInventory(product.id, null, kich_co, so_luong)
      }

      form.resetFields()
      setActiveTab("1") // Chuyển về tab danh sách sau khi cập nhật
    } catch (error) {
      console.error("Form validation failed:", error)
    }
  }

  // Columns cho bảng tồn kho
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
            form.setFieldsValue({
              kich_co: record.kich_co,
              so_luong: record.so_luong,
            })
            setActiveTab("2") // Chuyển sang tab cập nhật
          }}
        >
          Cập nhật
        </Button>
      ),
    },
  ]

  return (
    <Modal title={`Quản lý tồn kho: ${product.ten}`} open={visible} onCancel={onCancel} footer={null} width={800}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: "Danh sách tồn kho",
            children: (
              <Table
                columns={inventoryColumns}
                dataSource={product.inventory.map((inv) => ({ ...inv, key: inv.id }))}
                pagination={false}
              />
            ),
          },
          {
            key: "2",
            label: "Thêm/Cập nhật tồn kho",
            children: (
              <Form form={form} layout="vertical" onFinish={handleInventorySubmit}>
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
            ),
          },
        ]}
      />
    </Modal>
  )
}
