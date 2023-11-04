import React from "react"
import { Metadata } from "next"
import MemberDepartmentPage from "@/app/member-department/components/MemberDepartmentPage"

export default function page() {
  return <MemberDepartmentPage></MemberDepartmentPage>
}

export const metadata: Metadata = {
  title: "成员部门-客户端",
}
