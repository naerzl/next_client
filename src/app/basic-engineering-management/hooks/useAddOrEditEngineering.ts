import React from "react"
import { MaterialReceiveData } from "@/app/material-receipt/types"
import { EngineeringListing } from "@/app/basic-engineering-management/types/index.d"

export function useAddOrEditEngineering() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [editItem, setEditItem] = React.useState<EngineeringListing | null>(null)

  const handleAddEngineering = () => {
    setDrawerOpen(true)
  }

  const handleEditEngineering = (item: EngineeringListing) => {
    setDrawerOpen(true)
    setEditItem(item)
  }

  const handleCloseEngineeringWithDrawer = () => {
    setDrawerOpen(false)
    setEditItem(null)
  }

  return {
    drawerOpen,
    editItem,
    handleAddEngineering,
    handleEditEngineering,
    handleCloseEngineeringWithDrawer,
  }
}
