import React from "react"
import { TestDataList } from "@/app/test/types"

export function useLookTestDetail() {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const [detailItem, setDetailItem] = React.useState<TestDataList | null>(null)

  const handleLookTestDetailOpen = (item: TestDataList) => {
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
