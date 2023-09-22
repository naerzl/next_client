import React from "react"
import UnitProjectPage from "@/app/unit-project/components/UnitProjectPage"
import { Metadata } from "next"

function Page(props: any) {
  return <UnitProjectPage />
}

export default Page

export const metadata: Metadata = {
  title: "单位工程--客户端",
}
