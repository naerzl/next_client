import React from "react"
import CompletionManagementPage from "@/app/completion-management/components/CompletionManagementPage"
import { Metadata } from "next"

export default function Page() {
  return <CompletionManagementPage />
}

export const metadata: Metadata = {
  title: "竣工资料-客户端",
}
