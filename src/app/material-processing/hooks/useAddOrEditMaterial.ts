import React from "react"
import { MaterialProcessingData } from "@/app/material-processing/types"
export function useAddOrEditMaterial() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [editItem, setEditItem] = React.useState<MaterialProcessingData | null>(null)

  const handleAddMaterial = () => {
    setDrawerOpen(true)
  }

  const handleEditMaterial = (item: MaterialProcessingData) => {
    setDrawerOpen(true)
    setEditItem(item)
  }

  const handleCloseMaterialWithDrawer = () => {
    setDrawerOpen(false)
    setEditItem(null)
  }

  return {
    drawerOpen,
    editItem,
    handleAddMaterial,
    handleEditMaterial,
    handleCloseMaterialWithDrawer,
  }
}
