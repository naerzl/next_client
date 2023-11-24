import React from "react"
import { MaterialProcessingData } from "@/app/material-processing/types"

export function useLookDetail() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [detailItem, setDetailItem] = React.useState<MaterialProcessingData | null>(null)

  const handleLookTestDetailOpen = (item: MaterialProcessingData) => {
    setDrawerOpen(true)
    setDetailItem(item)
  }

  const handleCloseLookTestDetailDrawer = () => {
    setDrawerOpen(false)
    setDetailItem(null)
  }

  return {
    drawerOpen,
    detailItem,
    handleLookTestDetailOpen,
    handleCloseLookTestDetailDrawer,
  }
}
