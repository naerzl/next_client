import React from "react"

export const LayoutContext = React.createContext<{
  projectId: number
  changeProject: (id: number) => void
}>({
  projectId: 0,
  changeProject: (id: number) => {},
})
