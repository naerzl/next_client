import React from "react"
import { Metadata } from "next"
import WorkingPoint from "@/app/working-point/components/Working-point"

function Page() {
  return <WorkingPoint />
}

export default Page

export const metadata: Metadata = {
  title: "工点数据--客户端",
}
