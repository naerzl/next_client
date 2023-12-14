"use client"
import { Inter } from "next/font/google"
import Side from "@/components/Side"
import React from "react"
import Nav from "@/components/Nav"
import { SWRConfig } from "swr"
import { usePathname, useRouter, useSelectedLayoutSegment } from "next/navigation"
import StyledComponentsRegistry from "@/libs/AntdRegistry"
import "./globals.scss"
import { ConfirmProvider } from "material-ui-confirm"
import { generateRandomString } from "@/libs/methods"
import { getV1BaseURL } from "@/libs/fetch"
import { lrsOAuth2Instance } from "@/libs"
import {
  MINTE5,
  OAUTH2_ACCESS_TOKEN,
  OAUTH2_PATH_FROM,
  OAUTH2_PROJECT_ID,
  OAUTH2_TOKEN_EXPIRY,
  STATUS_SUCCESS,
} from "@/libs/const"
import { getCookie, setCookie } from "@/libs/cookies"
import { StatusCodes } from "http-status-codes"
import dayjs from "dayjs"
import { ConfirmationDialogProvider } from "@/components/ConfirmationDialogProvider"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LayoutContext } from "@/components/LayoutContext"
import { ReqGetProjectCurrentResponse } from "@/app/member-department/types"
import { reqGetCurrentProject } from "@/app/member-department/api"
import { reqGetPermission } from "@/app/api"
import { PermissionData } from "@/types/api"
import { message } from "antd"
import { SnackbarProvider } from "notistack"

const inter = Inter({ subsets: ["latin"] })

const blackList = ["/", "/auth2/"]

export default function RootLayout({ children }: { children: React.ReactElement }) {
  const pathname = usePathname()

  const segment = useSelectedLayoutSegment()

  const router = useRouter()

  const handleGoToLogin = async () => {
    const state = generateRandomString()
    // 补货到抛出的错误 重新初始化token 重新登录
    const res = await lrsOAuth2Instance.lrsOAuth2Initiate(getV1BaseURL("/initiate"), {
      state,
      redirect_url: location.origin + "/auth2",
    })
    if (res.code === STATUS_SUCCESS) {
      // 存储当前的url地址
      setCookie(OAUTH2_PATH_FROM as string, location.origin + "/dashboard")
      // 跳转到登录页面的地址
      location.href = res.data.location
    }
  }

  const [waitToken, setWaitToken] = React.useState(false)

  const refreshToken = async (token: string) => {
    try {
      setWaitToken(true)
      const resRefresh = await lrsOAuth2Instance.lrsOAuth2rRefreshToken(
        getV1BaseURL("/refresh"),
        `Bearer ${token}`,
      )
      if (resRefresh.status == StatusCodes.UNAUTHORIZED) {
        throw new Error("401")
      }
      const result = await resRefresh.json()
      if (result.code == STATUS_SUCCESS) {
        // 设置新的cookie
        // setCookie(OAUTH2_ACCESS_TOKEN, result.data.access_token)
        localStorage.setItem(OAUTH2_ACCESS_TOKEN, result.data.access_token)
      }
    } finally {
      setWaitToken(false)
    }
  }

  const [accessToken, setAccessToken] = React.useState<string | null>(null)

  React.useEffect(() => {
    let token = localStorage.getItem(OAUTH2_ACCESS_TOKEN)

    setAccessToken(token)

    if (pathname != "/" && pathname != "/auth2/") {
      if (!token) {
        handleGoToLogin()
      } else {
        const time = localStorage.getItem(OAUTH2_TOKEN_EXPIRY)
        if (dayjs(time).unix() * 1000 - Date.now() < MINTE5) {
          refreshToken(token)
        }
      }
    }
  }, [pathname])

  const [projectId, setProjectId] = React.useState(
    getCookie(OAUTH2_PROJECT_ID) ? Number(getCookie(OAUTH2_PROJECT_ID)) : 0,
  )

  const changeProjectId = (id: number) => {
    setProjectId(id)
    setCookie(OAUTH2_PROJECT_ID, String(id))
  }

  const [projectList, setProjectList] = React.useState<ReqGetProjectCurrentResponse[]>([])

  const [waitWithProjectAndPermission, setWaitWithProjectAndPermission] = React.useState(false)

  const [permission, setPermission] = React.useState<PermissionData[]>([])

  const [permissionTagList, setPermissionTagList] = React.useState<string[]>([])

  const getProjectList = async () => {
    try {
      setWaitWithProjectAndPermission(true)
      const res = await reqGetCurrentProject("/project/current")
      // 当前项目数据为null 跳转
      if (!res) {
        message.error("您未在项目内，5秒内将为您跳转至官网！")
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(0)
          }, 5000)
        })

        router.push(process.env.NEXT_PUBLIC_WEB_PATH as string)
      }

      // 筛选出项目不为null的
      const newRes = res.filter((item) => item.project != null)
      setProjectList(newRes ?? [])
      const obj = newRes.find((item) => item.is_default == 1)

      const noNullItem = newRes.find((item) => item.project != null)
      // 如果所有的子项目为空
      if (!noNullItem) {
        message.error("您未在项目内，5秒内将为您跳转至官网！")
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(0)
          }, 5000)
        })

        router.push(process.env.NEXT_PUBLIC_WEB_PATH as string)
      }
      let _projectId = 1

      if (obj) {
        _projectId = obj.project.id
      } else {
        if (noNullItem) {
          _projectId = noNullItem.project.id
        } else {
          message.error("您未在项目内，5秒内将为您跳转至官网！")
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(0)
            }, 5000)
          })

          router.push(process.env.NEXT_PUBLIC_WEB_PATH as string)
        }
      }

      changeProjectId(_projectId)

      //  获取相关权限

      const resPermission = await reqGetPermission("/permission", {
        arg: { project_id: _projectId },
      })

      setPermission(resPermission)
      setPermissionTagList(
        resPermission.map((item) => {
          const tag = item.permission + "_" + item.action
          return tag.trim()
        }),
      )

      return ""
    } finally {
      setWaitWithProjectAndPermission(false)
    }
  }

  React.useEffect(() => {
    if (!pathname.startsWith("/auth2") && pathname != "/" && projectList.length <= 0) {
      getProjectList()
    }
  }, [pathname])

  const changePermissionTagList = (arr: string[]) => {
    setPermissionTagList(arr)
  }

  const changeProjectList = (arr: ReqGetProjectCurrentResponse[]) => {
    setProjectList(arr)
  }

  const changePermissionList = (arr: PermissionData[]) => {
    setPermission(arr)
  }

  if (
    (!accessToken && segment && segment != "auth2") ||
    waitToken ||
    waitWithProjectAndPermission
  ) {
    return (
      <html lang="en" id="_next">
        <meta name="version" content="1.0.0" />
        <body className={`${inter.className} flex`}>
          <div className="container">
            <div className="loader"></div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" id="_next">
      <meta name="version" content="1.0.0" />
      <body className={`${inter.className} flex`}>
        <LayoutContext.Provider
          value={{
            projectId,
            changeProject: changeProjectId,
            projectList,
            permissionList: permission,
            permissionTagList: permissionTagList,
            getProjectList,
            changePermissionTagList,
            changeProjectList,
            changePermissionList,
          }}>
          <SnackbarProvider maxSnack={5}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StyledComponentsRegistry>
                <SWRConfig value={{ provider: () => new Map() }}>
                  <ConfirmProvider>
                    <ConfirmationDialogProvider>
                      {!blackList.includes(pathname) && (
                        <div className="flex flex-col w-full">
                          <Nav />
                          <div className="flex-1 flex  bg-[#f8fafb] w-full overflow-hidden">
                            <aside className="h-full w-60  min-w-[15rem]">
                              <Side />
                            </aside>
                            <main
                              className="px-7.5 py-12  flex flex-col flex-1 overflow-hidden"
                              // style={{ height: "calc(100vh - 64px)" }}
                            >
                              {children}
                            </main>
                          </div>
                        </div>
                      )}
                      {pathname == "/" && <>{children}</>}
                      {pathname == "/auth2/" && <>{children}</>}
                    </ConfirmationDialogProvider>
                  </ConfirmProvider>
                </SWRConfig>
              </StyledComponentsRegistry>
            </LocalizationProvider>
          </SnackbarProvider>
        </LayoutContext.Provider>
      </body>
    </html>
  )
}
