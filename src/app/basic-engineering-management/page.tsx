import React from "react"
import { Metadata } from "next"
import BasicEngineeringManagementPage from "@/app/basic-engineering-management/components/BasicEngineeringManagementPage"

export default function Page() {
  return <BasicEngineeringManagementPage />
}

export const metadata: Metadata = {
  title: "基础工程管理",
}
