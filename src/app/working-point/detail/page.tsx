import React from "react"
import { Metadata } from "next"
import WorkingPointDetailPage from "@/app/working-point/detail/components/WorkingPointDetailPage"

export default function Page() {
  return <WorkingPointDetailPage />
}

export const metadata: Metadata = {
  title: "添加工点数据",
}
