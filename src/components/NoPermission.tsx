"use client"
import React from "react"
import { useRouter } from "next/navigation"

function NoPermission() {
  const router = useRouter()

  router.push("/dashboard")
  return <div></div>
}

export default NoPermission
