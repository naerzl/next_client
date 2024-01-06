import React from "react"

export default function useMaterialExport() {
  const [exportOpen, setExportOpen] = React.useState(false)

  const handleExportClose = () => {
    setExportOpen(false)
  }

  const handleExportOpen = () => {
    setExportOpen(true)
  }

  return {
    exportOpen,
    handleExportOpen,
    handleExportClose,
  }
}
