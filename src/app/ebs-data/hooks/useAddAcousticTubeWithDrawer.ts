import React from "react"
import { AcousticTubeListData } from "@/app/ebs-data/types"

const useAddAcousticTubeWithDrawer = () => {
  const [open, setOpen] = React.useState(false)

  const [editItem, setEditItem] = React.useState<AcousticTubeListData | null>(null)

  const handleOpenAddAcousticTubeWithDrawer = () => {
    setOpen(true)
  }

  const handleCloseAddAcousticTubeWithDrawer = () => {
    setOpen(false)
    setEditItem(null)
  }

  const handleEditAcousticTubeWithDrawer = (item: AcousticTubeListData) => {
    setOpen(true)
    setEditItem(item)
  }

  return {
    open,
    handleEditAcousticTubeWithDrawer,
    handleCloseAddAcousticTubeWithDrawer,
    handleOpenAddAcousticTubeWithDrawer,
    editItem,
  }
}

export default useAddAcousticTubeWithDrawer
