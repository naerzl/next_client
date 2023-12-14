import React from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import { Button, MenuItem, Select, SelectChangeEvent } from "@mui/material"
import { removeCookie } from "@/libs/cookies"
import { useRouter } from "next/navigation"
import { OAUTH2_ACCESS_TOKEN, OAUTH2_PROJECT_ID } from "@/libs/const"
import { reqPutProjectChangeDefault } from "@/app/api"
import { LayoutContext } from "@/components/LayoutContext"

const logo = "/static/images/logo.png"

const Nav = React.forwardRef(function Nav(_, ref) {
  const ctxLayout = React.useContext(LayoutContext)
  //  跳转到登录的（后期删掉）
  const router = useRouter()

  const handleLogout = () => {
    // 清楚cookie 跳到官网
    removeCookie(OAUTH2_PROJECT_ID)
    removeCookie(OAUTH2_ACCESS_TOKEN)
    localStorage.removeItem(OAUTH2_ACCESS_TOKEN)
    router.push("/" as string)
  }

  const [currentProject, setCurrentProject] = React.useState<number>(ctxLayout.projectId)

  React.useEffect(() => {
    setCurrentProject(ctxLayout.projectId)
  }, [ctxLayout.projectId])

  const handleChangeCurrentProject = async (event: SelectChangeEvent<number>) => {
    const obj = ctxLayout.projectList.find((item) => {
      if (item.project) {
        return item.project?.id == event.target.value
      } else {
        return false
      }
    })
    if (obj) {
      ctxLayout.changeProject(obj.project?.id)
      setCurrentProject(obj.project?.id)
      await reqPutProjectChangeDefault("/project/change-default", {
        arg: { project_id: obj.project?.id },
      })
      router.push("/dashboard")
      ctxLayout.getProjectList()
    }
  }

  return (
    <AppBar
      position="sticky"
      className="bg-[#fff] shadow-none max-h-16 w-full border-b"
      sx={{ zIndex: "10" }}>
      <Toolbar className="flex justify-between">
        {/* 导航左侧 */}
        <div className="h-16 flex items-center gap-1 max-h-16" style={{ fontSize: "24px" }}>
          <img src={logo} alt="" className="w-10 h-10" />
          <div className="text-base font-bold text-railway_303 flex-1">
            <Select
              ref={ref}
              fullWidth
              className="no-border-select"
              size="small"
              labelId="demo-simple-select-helper-label"
              id="no-border-select"
              value={currentProject}
              onChange={(event) => {
                handleChangeCurrentProject(event)
              }}>
              <MenuItem disabled>
                <i className="text-[#ababab]">请选择一个项目</i>
              </MenuItem>
              {ctxLayout.projectList.map((item, index) => (
                <MenuItem key={index} value={item.project?.id}>
                  {item.project?.name}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>

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
})

export default Nav
