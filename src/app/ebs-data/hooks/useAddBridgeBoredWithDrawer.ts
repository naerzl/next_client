import React from "react"
import { BridgeBoredBasicData } from "@/app/ebs-data/types"

const useAddBridgeBoredWithDrawer = () => {
  const [open, setOpen] = React.useState(false)

  const [editItem, setEditItem] = React.useState<BridgeBoredBasicData | null>(null)

  const handleOpenAddBridgeWithDrawer = () => {
    setOpen(true)
  }

  const handleCloseAddBridgeWithDrawer = () => {
    setOpen(false)
    setEditItem(null)
  }

  const handleEditBridgeWithDrawer = (item: BridgeBoredBasicData) => {
    setOpen(true)
    setEditItem(item)
  }

  return {
    open,
    handleEditBridgeWithDrawer,
    handleCloseAddBridgeWithDrawer,
    handleOpenAddBridgeWithDrawer,
    editItem,
  }
}

export default useAddBridgeBoredWithDrawer
