import React from "react"
import { Metadata } from "next"
import TestPage from "@/app/test/components/TestPage"

export default function Page() {
  return <TestPage />
}

export const metadata: Metadata = {
  title: "试验列表--客户端",
}
