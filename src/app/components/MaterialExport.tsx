import React from "react"
import { Dialog, DialogContent, DialogTitle } from "@mui/material"
type Props = {
  open: boolean
  handleClose: () => void
  children?: React.JSX.Element
}

export default function MaterialExport(props: Props) {
  const { open, handleClose } = props

  return (
    <>
      <Dialog
        onClose={handleClose}
        open={open}
        sx={{ zIndex: 99, ".MuiPaper-root": { maxWidth: "none" } }}
        className="custom">
        <DialogTitle>导出</DialogTitle>
        <DialogContent sx={{ width: "30vw" }}>{props.children}</DialogContent>
      </Dialog>
    </>
  )
}
