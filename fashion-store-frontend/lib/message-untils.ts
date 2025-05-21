"use client"

import { App } from "antd"
import type { MessageInstance } from "antd/es/message/interface"
import type { NotificationInstance } from "antd/es/notification/interface"
import { useEffect, useState } from "react"

let message: MessageInstance
let notification: NotificationInstance

// Tạo một component để lấy các instance của message và notification
export const MessageContainer = () => {
  const staticFunction = App.useApp()

  useEffect(() => {
    message = staticFunction.message
    notification = staticFunction.notification
  }, [staticFunction])

  return null
}

// Hàm tiện ích để hiển thị thông báo
export const showMessage = {
  success: (content: string) => {
    if (message) {
      message.success(content)
    }
  },
  error: (content: string) => {
    if (message) {
      message.error(content)
    }
  },
  warning: (content: string) => {
    if (message) {
      message.warning(content)
    }
  },
  info: (content: string) => {
    if (message) {
      message.info(content)
    }
  },
}

// Hàm tiện ích để hiển thị thông báo notification
export const showNotification = {
  success: (title: string, description?: string) => {
    if (notification) {
      notification.success({
        message: title,
        description,
      })
    }
  },
  error: (title: string, description?: string) => {
    if (notification) {
      notification.error({
        message: title,
        description,
      })
    }
  },
  warning: (title: string, description?: string) => {
    if (notification) {
      notification.warning({
        message: title,
        description,
      })
    }
  },
  info: (title: string, description?: string) => {
    if (notification) {
      notification.info({
        message: title,
        description,
      })
    }
  },
}

// Hook để sử dụng message trong functional components
export const useMessage = () => {
  const [messageApi, setMessageApi] = useState<MessageInstance | null>(null)
  const [notificationApi, setNotificationApi] = useState<NotificationInstance | null>(null)

  const staticFunction = App.useApp()

  useEffect(() => {
    setMessageApi(staticFunction.message)
    setNotificationApi(staticFunction.notification)
  }, [staticFunction])

  return {
    message: messageApi,
    notification: notificationApi,
  }
}
