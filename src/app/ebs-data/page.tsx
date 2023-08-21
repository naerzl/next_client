import React from "react"
import EBSDataPage from "@/app/ebs-data/components/EBSDataPage"
import { Metadata } from "next"

export default function Page(props: any) {
  return <EBSDataPage />
}

export const metadata: Metadata = {
  title: "EBS数据-客户端",
}
