import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"

const GanttContext = React.createContext<{
  changeEBSItem: (item: TypeEBSDataList) => void
  ebsItem: TypeEBSDataList & any
}>({
  changeEBSItem: () => {},
  ebsItem: {} as TypeEBSDataList & any,
})

export default GanttContext
