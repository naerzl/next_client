import React from "react"
import {
  TypeGetProjectSubSectionParams,
  TypeProjectSubSectionData,
  TypeSubSectionData,
} from "@/app/unit-project/types"

const UnitProjectContext = React.createContext<{
  tableList: TypeProjectSubSectionData[]
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

export default UnitProjectContext
