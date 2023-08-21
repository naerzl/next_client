"use client"
import React from "react"
import { Form, Input, Button } from "antd"
import { fetcher } from "@/libs/fetch"

export default function HomePage(props: any) {
  const onFinish = async (value: { abbreviation: string }) => {
    const res = await fetcher({
      url: "/project",
      method: "post",
      arg: { abbreviation: "大大怪将军" },
    })
    console.log(res, value)
  }
  return (
    <div className="h-full overflow-auto">
      this is homepage
      <Form initialValues={{ abbreviation: "小小怪下士" }} onFinish={onFinish}>
        <Form.Item name="abbreviation" rules={[{ required: true, message: "请填写内容" }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
