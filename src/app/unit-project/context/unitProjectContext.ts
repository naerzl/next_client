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
}>({
  tableList: [],
  getProjectSubSection() {},
  professionList: [],
})

export default UnitProjectContext
