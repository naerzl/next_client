import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"

const EBSDataContext = React.createContext<{
  handleExpandChange: (expanded: boolean, record: TypeEBSDataList) => Promise<any>
  tableData: TypeEBSDataList[]
  ebsItem: TypeEBSDataList
  changeEBSItem: (item: TypeEBSDataList) => void
}>({
  handleExpandChange: () => Promise.resolve(),
  tableData: [],
  ebsItem: {} as TypeEBSDataList,
  changeEBSItem: () => {},
})

export default EBSDataContext
