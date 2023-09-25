"use client"
import { Inter } from "next/font/google"
import Side from "@/components/Side"
import React from "react"
import Nav from "@/components/Nav"
import { SWRConfig } from "swr"
import { usePathname, useRouter } from "next/navigation"
import StyledComponentsRegistry from "@/libs/AntdRegistry"
import "./globals.scss"
import { ConfirmProvider } from "material-ui-confirm"
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"

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
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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
            </ConfirmProvider>
          </SWRConfig>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
