import React from "react"
import { TypeSubSectionData } from "@/app/unit-project/types"
import {
  TypeGetProjectSubSectionParams,
  TypeProjectSubSectionData,
} from "@/app/working-point/types"

const WorkingPointContext = React.createContext<{
  tableList: TypeProjectSubSectionData[] & any
  getProjectSubSection: (option?: TypeGetProjectSubSectionParams) => void
  professionList: TypeSubSectionData[]
  editItem: TypeProjectSubSectionData | null
  changeEditItem: (item: TypeProjectSubSectionData | null) => void
}>({
  tableList: [],
  getProjectSubSection() {},
  professionList: [],
  editItem: null,
  changeEditItem: () => {},
})

export default WorkingPointContext
