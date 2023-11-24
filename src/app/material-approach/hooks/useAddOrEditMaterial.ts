import React from "react"
import { MaterialApproachData } from "@/app/material-approach/types"
export function useAddOrEditMaterial() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [editItem, setEditItem] = React.useState<MaterialApproachData | null>(null)

  const handleAddMaterial = () => {
    setDrawerOpen(true)
  }

  const handleEditMaterial = (item: MaterialApproachData) => {
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
