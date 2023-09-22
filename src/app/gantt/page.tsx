import React from "react"
import dynamic from "next/dynamic"
import { Metadata } from "next"

const GanttPage = dynamic(() => import("./components/GanttPage"), {
  ssr: false,
})

export default function page() {
  return <GanttPage />
}

export const metadata: Metadata = {
  title: "施工计划-客户端",
}
