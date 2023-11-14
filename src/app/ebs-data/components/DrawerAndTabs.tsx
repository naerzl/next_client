"use clinet"
import { Box, Divider, Drawer, IconButton, Tab, Tabs } from "@mui/material"
import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import ProcessList from "./ProcessList"
import DesignData from "./DesignData"

type Props = {
  open: boolean
  handleCloseDrawerProcess: () => void
  item: TypeEBSDataList
}

function TabPanel(props: any) {
  const { children, value, index } = props

  return <>{value == index && <Box sx={{ p: 3, flex: 1 }}>{children}</Box>}</>
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export default function DrawerAndTabs(props: Props) {
  const { open, handleCloseDrawerProcess, item } = props
  const handleClose = () => {
    handleCloseDrawerProcess()
  }

  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <>
      <Drawer open={open} onClose={handleClose} anchor="right" sx={{ zIndex: 1600 }}>
        <Box sx={{ flexGrow: 1, bgcolor: "background.paper", display: "flex", width: "85vw" }}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: "divider" }}>
            <Tab label="设计数据" {...a11yProps(0)} />
            <Tab label="工序列表" {...a11yProps(1)} />
          </Tabs>
          <TabPanel value={value} index={0}>
            {value == 0 && <DesignData />}
          </TabPanel>
          <TabPanel value={value} index={1}>
            <ProcessList />
          </TabPanel>
        </Box>
      </Drawer>
    </>
  )
}
