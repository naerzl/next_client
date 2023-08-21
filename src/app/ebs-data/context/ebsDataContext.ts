import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"

const EBSDataContext = React.createContext<{
  handleExpandChange: (expanded: boolean, record: TypeEBSDataList) => void
  tableData: TypeEBSDataList[]
}>({
  handleExpandChange: () => {},
  tableData: [],
})

export default EBSDataContext
