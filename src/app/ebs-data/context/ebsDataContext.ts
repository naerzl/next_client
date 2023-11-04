import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"

const EBSDataContext = React.createContext<{
  handleExpandChange: (expanded: boolean, record: TypeEBSDataList) => Promise<any>
  tableData: TypeEBSDataList[]
}>({
  handleExpandChange: () => Promise.resolve(),
  tableData: [],
})

export default EBSDataContext
