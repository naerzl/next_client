import React from "react"
import { Metadata } from "next"
import MaterialProcessingPage from "@/app/material-processing/components/MaterialProcessingPage"

export default function Page() {
  return <MaterialProcessingPage />
}

export const metadata: Metadata = {
  title: "物资加工-客户端",
}
