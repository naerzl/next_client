"use client"
import React from "react"
import { reqGetUserCurrent } from "@/app/dashboard/api"
import { UserCurrentData } from "@/app/dashboard/index"
import { useRouter, useParams } from "next/navigation"

function Page() {
  const [userInfo, setUserInfo] = React.useState<UserCurrentData>({} as UserCurrentData)

  const router = useRouter()
  const params = useParams()

  console.log(router, params)
  const getUserCurrent = async () => {
    const res = await reqGetUserCurrent("/user/current")
    setUserInfo(res)
  }

  React.useEffect(() => {
    getUserCurrent()
  }, [])

  return <div>{userInfo.name ? `${userInfo.name},欢迎您` : "dashboard"}</div>
}

export default Page
