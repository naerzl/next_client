import React from "react"
import { TypeProjectSubSectionData, TypeSubSectionData } from "@/app/unit-project/types"
import { TypeGetProjectSubSectionParams } from "@/app/working-point/types"

const WorkingPointContext = React.createContext<{
  tableList: TypeProjectSubSectionData[]
  getProjectSubSection: (option?: TypeGetProjectSubSectionParams) => void
  professionList: TypeSubSectionData[]
}>({
  tableList: [],
  getProjectSubSection() {},
  professionList: [],
})

export default WorkingPointContext
