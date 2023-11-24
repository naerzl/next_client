import React, { Suspense } from "react"
import Auth2Page from "@/app/auth2/components/Auth2Page"

function Page() {
  return (
    <Suspense fallback={<></>}>
      <Auth2Page />
    </Suspense>
  )
}

export default Page
