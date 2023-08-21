"use client"
import { Inter } from "next/font/google"
import Side from "@/components/Side"
import React from "react"
import Nav from "@/components/Nav"
import { Breadcrumbs } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { SWRConfig } from "swr"
import { usePathname } from "next/navigation"
import StyledComponentsRegistry from "@/libs/AntdRegistry"
import "./globals.scss"

const inter = Inter({ subsets: ["latin"] })

const routeData = [
  {
    path: "/design-data",
    name: "设计数据",
  },
  {
    path: "/dictionary",
    name: "数据字典",
  },
]

const handleFindTitle = (path: string) => {
  const route = routeData.find((item) => item.path == path)
  return route ? route.name : "首页"
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname()

  return (
    <html lang="en" id="_next">
      <body className={`${inter.className} flex`}>
        <StyledComponentsRegistry>
          <SWRConfig value={{ provider: () => new Map() }}>
            <aside className="h-full w-60  min-w-[15rem]">
              <Side />
            </aside>
            <div className="flex-1 flex  flex-col bg-[#f8fafb] min-w-[50.625rem] overflow-overlay">
              <Nav />
              <main className="p-7 flex-1 max-main flex flex-col">
                <h3 className="font-bold text-[1.875rem]">{handleFindTitle(pathName)}</h3>
                <Breadcrumbs aria-label="breadcrumb" className="my-2">
                  <Link underline="hover" color="inherit" href="/">
                    MUI
                  </Link>
                  <Link
                    underline="hover"
                    color="inherit"
                    href="/material-ui/getting-started/installation/">
                    Core
                  </Link>
                  <Typography color="text.primary">Breadcrumbs</Typography>
                </Breadcrumbs>
                <div className="flex-1 flex-shrink-0 overflow-auto bg-white">{children}</div>
              </main>
            </div>
          </SWRConfig>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
