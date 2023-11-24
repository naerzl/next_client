import React from "react"
import { Metadata } from "next"
import dynamic from "next/dynamic"
// import CompletionManagementPage from "@/app/completion-management/components/CompletionManagementPage"

const CompletionManagementPage = dynamic(() => import("./components/CompletionManagementPage"), {
  ssr: false,
})
export default function Page() {
  return <CompletionManagementPage />
}

export const metadata: Metadata = {
  title: "竣工资料-客户端",
}
