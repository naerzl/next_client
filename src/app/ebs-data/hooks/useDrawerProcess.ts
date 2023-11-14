import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"

export default function useDrawerProcess() {
  const [drawerProcessOpen, setDrawerProcessOpen] = React.useState(false)
  const [item, setItem] = React.useState<TypeEBSDataList>({} as TypeEBSDataList)

  const handleCloseDrawerProcess = () => {
    setDrawerProcessOpen(false)
    setItem({} as TypeEBSDataList)
  }
  const handleOpenDrawerProcess = (item: TypeEBSDataList) => {
    setDrawerProcessOpen(true)
    setItem(item)
  }

  return { drawerProcessOpen, handleOpenDrawerProcess, handleCloseDrawerProcess, item }
}
