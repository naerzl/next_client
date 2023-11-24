import React from "react"
import { ConcreteData } from "@/app/ebs-data/types"

const useAddConcreteWithDrawer = () => {
  const [open, setOpen] = React.useState(false)

  const [editItem, setEditItem] = React.useState<ConcreteData | null>(null)

  const handleOpenAddConcreteWithDrawer = () => {
    setOpen(true)
  }

  const handleCloseAddConcreteWithDrawer = () => {
    setOpen(false)
    setEditItem(null)
  }

  const handleEditConcreteWithDrawer = (item: ConcreteData) => {
    setOpen(true)
    setEditItem(item)
  }

  return {
    open,
    handleEditConcreteWithDrawer,
    handleCloseAddConcreteWithDrawer,
    handleOpenAddConcreteWithDrawer,
    editItem,
  }
}

export default useAddConcreteWithDrawer
