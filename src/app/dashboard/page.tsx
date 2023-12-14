"use client"
import React from "react"
import { reqGetUserCurrent } from "@/app/dashboard/api"
import { UserCurrentData } from "@/app/dashboard/index"
import { LayoutContext } from "@/components/LayoutContext"

function Page() {
  const [userInfo, setUserInfo] = React.useState<UserCurrentData>({} as UserCurrentData)
  const layoutCtx = React.useContext(LayoutContext)

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
