import React from "react"
import { Box, Tab, Tabs } from "@mui/material"
import BaseForm from "@/app/gantt/components/BaseForm"
import RebarForm from "@/app/gantt/components/RebarForm"
import ConcreteForm from "./ConcreteForm"

function TabPanel(props: any) {
  const { children, value, index } = props

  return <>{value == index && <Box sx={{ p: 3, flex: 1 }}>{children}</Box>}</>
}

export default function DesignData() {
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <div>
      <Tabs value={value} onChange={handleChange} aria-label="Vertical tabs example">
        <Tab label="基数数据表" />
        <Tab label="钢筋数量表" />
        <Tab label="混凝土表" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <BaseForm />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <RebarForm />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ConcreteForm />
      </TabPanel>
    </div>
  )
}
