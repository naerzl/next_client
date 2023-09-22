"use client"
import React from "react"
import SendIcon from "@mui/icons-material/Send"
import BallotIcon from "@mui/icons-material/Ballot"
import DatasetLinkedIcon from "@mui/icons-material/DatasetLinked"
import { List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material"
import Link from "next/link"
import { usePathname } from "next/navigation"

function Side() {
  const logo = "/static/images/logo.png"
  const pathName = usePathname()
  return (
    <List
      sx={{ width: "100%", maxWidth: "15rem", bgcolor: "background.paper" }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader
          component="div"
          id="nested-list-subheader"
          className="h-16 flex items-center gap-1 max-h-16"
          sx={{ fontSize: "24px" }}>
          <img src={logo} alt="" className="w-12 h-12" />
          <div>客户端</div>
        </ListSubheader>
      }>
      <Link href={"/ebs-data"}>
        <ListItemButton sx={pathName == "/ebs-data" ? { bgcolor: "#eef0f1" } : {}}>
          <ListItemIcon>
            <SendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>EBS数据</ListItemText>
        </ListItemButton>
      </Link>

      <Link href={"/unit-project"}>
        <ListItemButton sx={pathName == "/unit-project" ? { bgcolor: "#eef0f1" } : {}}>
          <ListItemIcon>
            <BallotIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>单位工程</ListItemText>
        </ListItemButton>
      </Link>

      <Link href={"/working-point"}>
        <ListItemButton sx={pathName == "/working-point" ? { bgcolor: "#eef0f1" } : {}}>
          <ListItemIcon>
            <DatasetLinkedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>工点数据</ListItemText>
        </ListItemButton>
      </Link>
    </List>
  )
}

export default Side
