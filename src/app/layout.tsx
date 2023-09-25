"use client"
import { Inter } from "next/font/google"
import Side, { changeMenu, ItemCombination, MenuItemX } from "@/components/Side"
import React, { useEffect, useState } from "react"
import Nav from "@/components/Nav"
import { Breadcrumbs } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { SWRConfig } from "swr"
import { usePathname, useRouter } from "next/navigation"
import StyledComponentsRegistry from "@/libs/AntdRegistry"
import "./globals.scss"
import { ConfirmProvider } from "material-ui-confirm"
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import { trim } from "@/libs/methods"

const inter = Inter({ subsets: ["latin"] })

const menuList: MenuItemX = {
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
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pathArr = trim(pathname, "/").split("/")
  // 路由对象
  const router = useRouter()

  // 注册状态
  const [menus, setMenus] = useState(menuList)

  // 菜单点击事件
  const whenMenuClick = (currentItems: ItemCombination, previousItems?: ItemCombination) => {
    let focusItems = changeMenu(menuList, currentItems, previousItems)

    // 处理跳转
    if (currentItems.item.path != null) {
      router.push(currentItems.item.path)
    }

    setMenus({ ...focusItems })

    return true
  }

  useEffect(() => {
    Object.keys(menuList).map((index) => {
      if (typeof menuList[index].children != "undefined" && menuList[index].children![pathArr[0]]) {
        menuList[index].open = true
        menuList[index].children![pathArr[0]].open = true
      }
    })
    setMenus({ ...menuList })
  }, [pathname])

  return (
    <html lang="en" id="_next">
      <meta name="version" content="1.0.0" />
      <body className={`${inter.className} flex`}>
        <StyledComponentsRegistry>
          <SWRConfig value={{ provider: () => new Map() }}>
            <ConfirmProvider>
              {pathname != "/" ? (
                <>
                  <aside className="h-full w-60  min-w-[15rem]">
                    <Side items={menus} onClick={whenMenuClick} />
                  </aside>
                  <div className="flex-1 flex  flex-col bg-[#f8fafb] min-w-[50.625rem] overflow-y-auto">
                    <Nav />
                    <main className="px-7.5 py-12  flex flex-col flex-1">{children}</main>
                  </div>
                </>
              ) : (
                <>{children}</>
              )}
            </ConfirmProvider>
          </SWRConfig>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
