"use client"
import { Inter } from "next/font/google"
import Side from "@/components/Side"
import React from "react"
import Nav from "@/components/Nav"
import { SWRConfig } from "swr"
import { usePathname, useSelectedLayoutSegment } from "next/navigation"
import StyledComponentsRegistry from "@/libs/AntdRegistry"
import "./globals.scss"
import { ConfirmProvider } from "material-ui-confirm"
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import { generateRandomString } from "@/libs/methods"
import { getV1BaseURL } from "@/libs/fetch"
import { lrsOAuth2Instance } from "@/libs"
import {
  MINTE5,
  OAUTH2_ACCESS_TOKEN,
  OAUTH2_PATH_FROM,
  OAUTH2_TOKEN_EXPIRY,
  STATUS_SUCCESS,
} from "@/libs/const"
import { setCookie } from "@/libs/cookies"
import { StatusCodes } from "http-status-codes"
import dayjs from "dayjs"
import { ConfirmationDialogProvider } from "@/components/ConfirmationDialogProvider"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"

const inter = Inter({ subsets: ["latin"] })

const menuList = {
  commonLibrary: {
    title: "工程结构",
    icon: <ArchiveOutlinedIcon />,
    open: false,
    children: {
      "unit-project": {
        path: "/unit-project",
        title: "单位工程",
        open: false,
      },
      "working-point": {
        path: "/working-point",
        title: "工点数据",
        open: false,
      },
    },
  },
  dataTemplate: {
    title: "功能模块",
    icon: <TuneOutlinedIcon />,
    open: false,
    children: {
      gantt: {
        path: "/gantt",
        title: "施工计划",
        open: false,
      },
    },
  },
}
export default function RootLayout({ children }: { children: React.ReactElement }) {
  const pathname = usePathname()

  const segment = useSelectedLayoutSegment()

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

  const refreshToken = async (token: string) => {
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

  if (!accessToken && segment && segment != "auth2") {
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <StyledComponentsRegistry>
            <SWRConfig value={{ provider: () => new Map() }}>
              <ConfirmProvider>
                <ConfirmationDialogProvider>
                  {pathname != "/" ? (
                    <>
                      <aside className="h-full w-60  min-w-[15rem]">
                        {/*<Side items={menus} onClick={whenMenuClick} />*/}
                        <Side />
                      </aside>
                      <div className="flex-1 flex  flex-col bg-[#f8fafb] min-w-[50.625rem] overflow-y-auto">
                        <Nav />
                        <main className="px-7.5 py-12  flex flex-col flex-1">{children}</main>
                      </div>
                    </>
                  ) : (
                    <>{children}</>
                  )}
                </ConfirmationDialogProvider>
              </ConfirmProvider>
            </SWRConfig>
          </StyledComponentsRegistry>
        </LocalizationProvider>
      </body>
    </html>
  )
}
