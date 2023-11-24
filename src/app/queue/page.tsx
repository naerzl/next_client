import React from "react"
import { Metadata } from "next"
import QueuePage from "@/app/queue/components/QueuePage"

export default function Page() {
  return <QueuePage />
}

export const metadata: Metadata = {
  title: "导出任务-客户端",
}
