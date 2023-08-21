import React from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import {
  InputAdornment,
  InputBase,
  Divider,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import MailOutlineIcon from "@mui/icons-material/MailOutline"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import PublicIcon from "@mui/icons-material/Public"
import { setCookie } from "@/libs/cookies"
import { generateRandomString } from "@/libs/methods"
import { lrsOAuth2Instance } from "@/libs/init_oauth"
import { useRouter } from "next/navigation"
import { getV1BaseURL } from "@/libs/fetch"
import { OAUTH2_PATH_FROM } from "@/libs/const"

function Nav() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [anchorEl1, setAnchorEl1] = React.useState<null | HTMLElement>(null)
  const avatarOpen = Boolean(anchorEl)
  const languageOpen = Boolean(anchorEl1)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClick1 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl1(event.currentTarget)
  }

  // 管理菜单
  const handleClose = () => {
    setAnchorEl(null)
    setAnchorEl1(null)
  }

  //  跳转到登录的（后期删掉）
  const router = useRouter()
  const handleClickOauth2 = () => {
    const state = generateRandomString()
    lrsOAuth2Instance
      .lrsOAuth2Initiate(getV1BaseURL("/initiate"), {
        state,
        redirect_url: location.origin + "/auth2",
      })
      .then((res) => {
        if (res.code === 2000) {
          setCookie(OAUTH2_PATH_FROM as string, location.href)
          router.push(res.data.location)
        }
      })
  }

  return (
    <AppBar position="static" className="bg-[#fff] shadow-none max-h-16">
      <Toolbar className="flex justify-between">
        {/* 导航左侧 */}
        <div>
          <IconButton
            size="large"
            edge="start"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={handleClickOauth2}>
            <MenuIcon />
          </IconButton>
          <InputBase
            className="w-72 bg-[#f8fafb] border rounded-md px-2"
            placeholder="Search..."
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  edge="end"
                  sx={{ p: "10px" }}
                  aria-label="search"
                  disableRipple>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </div>

        {/* 导航右侧 */}
        <div className="text-railway_blue  flex justify-between items-center">
          {/* 语言 */}
          <Button
            id="language"
            sx={{ color: "#707070" }}
            startIcon={<PublicIcon sx={{ mr: -1.5 }} />}
            endIcon={languageOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
            onClick={handleClick1}></Button>
          <Menu
            id="language"
            anchorEl={anchorEl1}
            open={languageOpen}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}>
            <MenuItem onClick={handleClose}>英语</MenuItem>
            <MenuItem onClick={handleClose}>中文</MenuItem>
            <MenuItem onClick={handleClose}>方言</MenuItem>
          </Menu>
          <Divider sx={{ height: 28, m: 2 }} orientation="vertical" />

          {/* 信息 */}
          <Badge color="error" variant="dot">
            <MailOutlineIcon sx={{ color: "#707070" }} />
          </Badge>
          <Badge color="error" variant="dot">
            <NotificationsNoneIcon sx={{ ml: 2.5, color: "#707070" }} />
          </Badge>
          <Divider sx={{ height: 28, m: 2 }} orientation="vertical" />

          {/* 用户头像一些操作 */}
          <Avatar sx={{ bgcolor: "#ff8a48" }}>MA</Avatar>
          <Button
            id="basic-button"
            sx={{ color: "#757575" }}
            aria-controls={avatarOpen ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={avatarOpen ? "true" : undefined}
            onClick={handleClick}
            endIcon={avatarOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}>
            Mark Anderson
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={avatarOpen}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}>
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>My account</MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default Nav
