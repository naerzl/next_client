"use client"
import React from "react"
import Dots from "@/app/components/Dots"
import { generateRandomString } from "@/libs/methods"
import { lrsOAuth2Instance } from "@/libs/init_oauth"
import { OAUTH2_ACCESS_TOKEN, OAUTH2_PATH_FROM, STATUS_SUCCESS } from "@/libs/const"
import { getCookie, setCookie } from "@/libs/cookies"
import { getV1BaseURL } from "@/libs/fetch"
import { useRouter } from "next/navigation"

const yuanStyle = {
  background: "linear-gradient(145deg, rgba(0,129,255,0.2) 0%, #22CCE2 83%)",
}
export default function HomePage(props: any) {
  const router = useRouter()

  console.log(process.env.NEXT_PUBLIC_API_BASE_URL)

  const handleGoToLogin = async () => {
    const state = generateRandomString()
    // 补货到抛出的错误 重新初始化token 重新登录
    const res = await lrsOAuth2Instance.lrsOAuth2Initiate(getV1BaseURL("/initiate"), {
      state,
      redirect_url: location.origin + "/auth2",
    })
    if (res.code === STATUS_SUCCESS) {
      // 存储当前的url地址
      setCookie(OAUTH2_PATH_FROM as string, location.href)
      // 跳转到登录页面的地址
      location.href = res.data.location
    }
  }

  let token = localStorage.getItem(OAUTH2_ACCESS_TOKEN)
  React.useEffect(() => {
    token && router.push("/dashboard")
  }, [])

  if (token) {
    return <></>
  }

  return (
    <div className="h-full overflow-auto w-full flex relative">
      <div className="flex-1 bg-[#0081ff] relative">
        <div
          className="w-[50rem] aspect-square rounded-full absolute -top-[14.5625rem] -left-[16.25rem]"
          style={yuanStyle}></div>
      </div>
      <div className="flex-1 bg-[#f3f4f6]"></div>

      <div className="h-[28.875rem] w-[30.75rem] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
        <div className="h-[8.75rem] absolute right-0">
          <Dots row={8} col={12} color="#eaedf0" />
        </div>
        <div className="h-[8.75rem] absolute bottom-0">
          <Dots row={8} col={12} color="#e5ebf0" />
        </div>

        <div className="w-[26.875rem] h-[25.25rem] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white flex flex-col shadow-2xl">
          <div className="flex-1 flex flex-col justify-end border-b">
            <p className="pl-[6.375rem] text-2xl text-[#58687c]">欢迎使用</p>
          </div>
          <div className="h-[14.125rem] bg-[#f8fafb]">
            <p className="pl-[6.375rem] text-[#44566C] text-3xl font-bold">工程数字化管理系统</p>
            <div
              className="bg-[#0081FF] h-10 w-[21.875rem] mx-auto mt-14 leading-10 text-center text-white cursor-pointer"
              onClick={handleGoToLogin}>
              去登陆
            </div>
          </div>
          <div
            className="absolute w-[10.625rem] aspect-square bg-[#f4f8f9] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              borderRadius: "40px",
              boxShadow:
                "0px 12px 16px 0px rgba(169,194,209,0.1), 0px 2px 4px 0px rgba(169,194,209,0.05)",
            }}>
            <img src="/static/images/logo.png" className="w-3/4 aspect-square object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}
