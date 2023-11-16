import React from "react"
import { Metadata } from "next"
import dynamic from "next/dynamic"

const CompletionManagementPage = dynamic(
  import("@/app/completion-management/components/CompletionManagementPage"),
  {
    ssr: false,
  },
)
export default function Page() {
  return <CompletionManagementPage />
}

export const metadata: Metadata = {
  title: "竣工资料-客户端",
}
