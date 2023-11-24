"use client"
import React, { createContext, useContext, useState, ReactNode } from "react"
import ConfirmationDialog from "./ConfirmationDialog"

type ConfirmationDialogContextType = {
  // eslint-disable-next-line no-unused-vars
  showConfirmationDialog: (
    text: any,
    onConfirmCallback: () => void,
    onCancelCallBack?: () => void,
  ) => void
  hideConfirmationDialog: () => void
}

const ConfirmationDialogContext = createContext<ConfirmationDialogContextType | undefined>(
  undefined,
)

export const useConfirmationDialog = () => {
  const context = useContext(ConfirmationDialogContext)
  if (!context) {
    throw new Error("自定义弹窗ctx错误")
  }
  return context
}

type ConfirmationDialogProviderProps = {
  children: ReactNode
}

export const ConfirmationDialogProvider = ({ children }: ConfirmationDialogProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState<any>("")
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null)
  const [onCancel, setOnCancel] = useState<() => void | null>(() => {})

  const showConfirmationDialog = (
    text: string,
    onConfirmCallback: () => void,
    onCancelCallBack?: () => void,
  ) => {
    setIsOpen(true)
    setConfirmationText(text)
    setOnConfirm(() => {
      return () => {
        onConfirmCallback()
        setIsOpen(false)
      }
    })
    if (onCancelCallBack) {
      setOnCancel(() => {
        return () => {
          onCancelCallBack()
        }
      })
    }
    window.onkeydown = (ev) => {
      if (ev.code == "Enter") {
        onConfirmCallback()
        setIsOpen(false)
      }
    }
  }

  React.useEffect(() => {
    if (!isOpen) window.onkeydown = null
  }, [isOpen])

  const hideConfirmationDialog = () => {
    setIsOpen(false)
    onCancel && onCancel()
    setConfirmationText("")
    setOnConfirm(null)
  }

  return (
    <ConfirmationDialogContext.Provider value={{ showConfirmationDialog, hideConfirmationDialog }}>
      {children}
      {isOpen && (
        <ConfirmationDialog
          text={confirmationText}
          onConfirm={onConfirm!}
          onCancel={hideConfirmationDialog}
        />
      )}
    </ConfirmationDialogContext.Provider>
  )
}
