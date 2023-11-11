"use client"
import React from "react"
import { reqGetUserCurrent } from "@/app/dashboard/api"
import { UserCurrentData } from "@/app/dashboard/index"

function Page(props: any) {
  const [userInfo, setUserInfo] = React.useState<UserCurrentData>({} as UserCurrentData)

  const getUserCurrent = async () => {
    const res = await reqGetUserCurrent("/user/current")
    console.log(res)
    setUserInfo(res)
  }

  React.useEffect(() => {
    getUserCurrent()
  }, [])

  return <div>{userInfo.name ? `${userInfo.name},欢迎您` : "dashboard"}</div>
}

export default Page
