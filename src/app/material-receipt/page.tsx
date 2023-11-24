import React from "react"
import { Metadata } from "next"
import MaterialReceiptPage from "@/app/material-receipt/components/MaterialReceiptPage"

export default function Page() {
  return <MaterialReceiptPage />
}

export const metadata: Metadata = {
  title: "物资领用-客户端",
}
