import React from "react"
const useAuthSettingDialog = () => {
  const [dialogAuthSettingOpen, setDialogAuthSettingOpen] = React.useState(false)

  const handleOpenDialogAuthSetting = () => {
    setDialogAuthSettingOpen(true)
  }
  const handleCloseDialogAuthSetting = () => {
    setDialogAuthSettingOpen(false)
  }

  return {
    dialogAuthSettingOpen,
    handleCloseDialogAuthSetting,
    handleOpenDialogAuthSetting,
  }
}

export default useAuthSettingDialog
