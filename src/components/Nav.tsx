import React from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import { Button } from "@mui/material"
import { removeCookie } from "@/libs/cookies"
import { useRouter } from "next/navigation"
import { OAUTH2_ACCESS_TOKEN } from "@/libs/const"

// interface Props {
//   // eslint-disable-next-line no-unused-vars
//   changeCollapsed: (bool: boolean) => void
//   collapsed: boolean
// }
function Nav() {
  //  跳转到登录的（后期删掉）
  const router = useRouter()

  const handleLogout = () => {
    // 清楚cookie 跳到官网
    removeCookie(OAUTH2_ACCESS_TOKEN)
    router.push("/" as string)
  }

  return (
    <AppBar
      position="sticky"
      className="bg-[#fff] shadow-none max-h-16 border-b"
      sx={{ zIndex: "10" }}>
      <Toolbar className="flex justify-between">
        {/* 导航左侧 */}
        <div></div>

        {/* 导航右侧 */}
        <div className="text-railway_blue  flex justify-between items-center">
          {/* 语言 */}
          <Button sx={{ color: "#707070" }} onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default Nav
