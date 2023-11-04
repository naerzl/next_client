import React from "react"
import UnitProjectDetailPage from "@/app/unit-project/detail/components/UnitProjectDetailPage"
import { Metadata } from "next"

export default function Page() {
  return <UnitProjectDetailPage />
}

export const metadata: Metadata = {
  title: "添加单位工程",
}
