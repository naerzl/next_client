import React from "react"

const useDialogMaterialDemandWithCollect = () => {
  const [demandWithCollectOpen, setDemandWithCollectOpen] = React.useState(false)

  const handleCloseDialogWithMaterialDemandWithCollect = () => {
    setDemandWithCollectOpen(false)
  }
  const handleOpenDialogWithMaterialDemandWithCollect = () => {
    setDemandWithCollectOpen(true)
  }

  return {
    demandWithCollectOpen,
    handleCloseDialogWithMaterialDemandWithCollect,
    handleOpenDialogWithMaterialDemandWithCollect,
  }
}

export default useDialogMaterialDemandWithCollect
