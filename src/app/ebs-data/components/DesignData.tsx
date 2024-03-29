import React from "react"
import { Box, Tab, Tabs } from "@mui/material"
import BaseForm from "./BaseForm"
import RebarForm from "./RebarForm"
import ConcreteForm from "./ConcreteForm"
import AcousticTubeForm from "@/app/ebs-data/components/AcousticTubeForm"
import SpacerForm from "@/app/ebs-data/components/SpacerForm"

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
        <Tab label="声测管表" />
        <Tab label="垫块" />
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
      <TabPanel value={value} index={3}>
        <AcousticTubeForm />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <SpacerForm />
      </TabPanel>
    </div>
  )
}
