import React, { Suspense } from "react"
import { Metadata } from "next"
import EBSDetailPage from "@/app/unit-project/ebs-detail/components/EBSDetailPage"

function Page() {
  return (
    <Suspense fallback={<></>}>
      <EBSDetailPage />
    </Suspense>
  )
}

export default Page

export const metadata: Metadata = {
  title: "EBS数据",
}
