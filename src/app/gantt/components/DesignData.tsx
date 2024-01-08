import React from "react"
import { Box, Tab, Tabs } from "@mui/material"
import TableDesignData from "@/app/gantt/components/Table"
import { BridgeBoredBasicData } from "@/app/ebs-data/types"
import {
  ACOUSTIC_TUBE_DICTIONARY_CLASS_ID,
  BASIC_DICTIONARY_CLASS_ID,
  CONCRETE_DICTIONARY_CLASS_ID,
  Drill_Mode_Enum,
  Pile_Type_Enum,
  REBAR_DICTIONARY_CLASS_ID,
  SPACER_DICTIONARY_CLASS_ID,
} from "@/app/ebs-data/const"
import useSWRMutation from "swr/mutation"
import {
  reqGetAcousticTubeData,
  reqGetBridgeBoredBasicData,
  reqGetConcreteData,
  reqGetDictionary,
  reqGetRebarData,
  reqGetSpacerData,
} from "@/app/ebs-data/api"
import ganttContext from "@/app/gantt/context/ganttContext"
import { LayoutContext } from "@/components/LayoutContext"
import { renderProperty } from "@/app/ebs-data/const/method"
import { DictionaryData } from "@/app/gantt/types"
import Loading from "@/components/loading"

const baseFormHeaders = [
  {
    title: "桩径",
    key: "pile_diameter",
  },
  {
    title: "桩长",
    key: "pile_length",
  },
  {
    title: "桩顶标高(m)",
    key: "pile_top_elevation",
  },
  {
    title: "桩型",
    key: "pile_type",
  },
  {
    title: "钻孔方式",
    key: "dill_mode",
  },
  {
    title: "钢筋笼长度(m)",
    key: "rebar_cage_length",
  },
]

const concreteFormHeaders = [
  {
    title: "混凝土型号",
    key: "dictionaryName",
  },
  {
    title: "方量(m³)",
    key: "quantity",
  },
]

const acousticTubeDataFormHeaders = [
  {
    title: "声测管型号",
    key: "dictionaryName",
  },
  {
    title: "数量",
    key: "quantity",
  },
  {
    title: "单根长（m）",
    key: "length",
  },
]

const rebarFormHeaders = [
  {
    title: "钢筋编号",
    key: "rebar_no",
  },
  {
    title: "钢筋型号",
    key: "dictionaryName",
  },
  {
    title: "规格型号",
    key: "properties",
  },
  {
    title: "单位重(kg/m)",
    key: "unit_weight",
  },
  {
    title: "根数",
    key: "number",
  },
  {
    title: "单根长(m)",
    key: "unit_length",
  },
]

const spacerFormHeaders = [
  {
    title: "规格型号",
    key: "properties",
  },
  {
    title: "数量",
    key: "quantity",
  },
]

function renderCellType(item: BridgeBoredBasicData) {
  return Pile_Type_Enum.find((el) => el.value == item.pile_type)?.label
}

function renderCellDrillMode(item: BridgeBoredBasicData) {
  return Drill_Mode_Enum.find((el) => el.value == item.drill_mode)?.label
}

function baseDataToDesignTableData(arr: any[]) {
  return arr.map((row) => {
    return {
      pile_diameter: row.pile_diameter / 1000,
      pile_length: row.pile_length / 1000,
      pile_top_elevation: row.pile_top_elevation / 1000,
      pile_type: renderCellType(row),
      dill_mode: renderCellDrillMode(row),
      rebar_cage_length: row.rebar_cage_length / 1000,
    }
  })
}

function concreteDataToDesignTableData(arr: any[], dictionaryList: DictionaryData[]) {
  function findDictionaryItem(id: number): string {
    const item = dictionaryList.find((item) => item.id == id)
    return item ? item.name : ""
  }

  return arr.map((item) => {
    return {
      dictionaryName: findDictionaryItem(item.dictionary_id),
      quantity: item.quantity / 1000,
    }
  })
}

function acousticTubeDataToDesignTableData(arr: any[], dictionaryList: DictionaryData[]) {
  function findDictionaryItem(id: number): string {
    const item = dictionaryList.find((item) => item.id == id)
    return item ? item.name : ""
  }

  return arr.map((item) => {
    return {
      dictionaryName: findDictionaryItem(item.dictionary_id),
      quantity: item.quantity / 1000,
      length: item.length / 1000,
    }
  })
}

function rebarDataToDesignTableData(arr: any[], dictionaryList: DictionaryData[]) {
  function findDictionaryItem(id: number, type: "name" | "properties"): string {
    const item = dictionaryList.find((item) => item.id == id)

    return type == "name" ? (item ? item.name : "") : item ? item.properties : "[]"
  }

  return arr.map((item) => {
    return {
      rebar_no: item.rebar_no,
      dictionaryName: findDictionaryItem(item.dictionary_id, "name"),
      properties: renderProperty(findDictionaryItem(item.dictionary_id, "properties")),
      number: item.number / 1000,
      unit_length: item.unit_length / 1000,
      unit_weight: item.unit_weight / 1000,
    }
  })
}

function spacerDataToDesignTableData(arr: any[], dictionaryList: DictionaryData[]) {
  function findDictionaryItem(id: number, type: "name" | "properties"): string {
    const item = dictionaryList.find((item) => item.id == id)

    return type == "name" ? (item ? item.name : "") : item ? item.properties : "[]"
  }

  return arr.map((item) => {
    return {
      properties: renderProperty(findDictionaryItem(item.dictionary_id, "properties")),
      quantity: item.quantity / 1000,
    }
  })
}

export default function DesignData() {
  const ctx = React.useContext(ganttContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getBridgeBoredBasicDataApi } = useSWRMutation(
    "/bridge-bored-basic-datum",
    reqGetBridgeBoredBasicData,
  )

  const { trigger: getConcreteDataApi } = useSWRMutation("/material-concrete", reqGetConcreteData)

  const { trigger: getAcousticTubeDataApi } = useSWRMutation(
    "/material-acoustic-tube",
    reqGetAcousticTubeData,
  )

  const { trigger: getSpacerDataApi } = useSWRMutation("/material-spacer", reqGetSpacerData)

  const { trigger: getRebarDataApi } = useSWRMutation("/material-rebar", reqGetRebarData)

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [baseData, setBaseData] = React.useState<any[]>([])

  const [concreteData, setConcreteData] = React.useState<any[]>([])

  const [acousticTubeData, setAcousticTubeData] = React.useState<any[]>([])

  const [rebarData, setRebarData] = React.useState<any[]>([])

  const [spacerData, setSpacerData] = React.useState<any[]>([])

  const getBaseFormListData = async () => {
    const res = await getBridgeBoredBasicDataApi({
      ebs_id: parseInt(ctx.ebsItem.id),
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })

    setBaseData(baseDataToDesignTableData(res))
  }

  const getConcreteListData = async () => {
    const dictionaryData = await getDictionaryApi({ class_id: CONCRETE_DICTIONARY_CLASS_ID })

    const res = await getConcreteDataApi({
      ebs_id: parseInt(ctx.ebsItem.id),
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })

    setConcreteData(concreteDataToDesignTableData(res, dictionaryData))
  }

  const getAcousticTubeListData = async () => {
    const dictionaryData = await getDictionaryApi({ class_id: ACOUSTIC_TUBE_DICTIONARY_CLASS_ID })

    const res = await getAcousticTubeDataApi({
      ebs_id: parseInt(ctx.ebsItem.id),
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })

    setAcousticTubeData(acousticTubeDataToDesignTableData(res, dictionaryData))
  }

  const getRebarListData = async () => {
    const dictionaryData1 = await getDictionaryApi({ class_id: REBAR_DICTIONARY_CLASS_ID + 1 })
    const dictionaryData2 = await getDictionaryApi({ class_id: REBAR_DICTIONARY_CLASS_ID + 2 })

    const res = await getRebarDataApi({
      ebs_id: parseInt(ctx.ebsItem.id),
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })
    setRebarData(rebarDataToDesignTableData(res, [...dictionaryData1, ...dictionaryData2]))
  }

  const getSpacerListData = async () => {
    const dictionaryData1 = await getDictionaryApi({ class_id: SPACER_DICTIONARY_CLASS_ID })

    const res = await getSpacerDataApi({
      ebs_id: parseInt(ctx.ebsItem.id),
      project_id: PROJECT_ID,
      engineering_listing_id: ctx.ebsItem.engineering_listing_id!,
    })

    setSpacerData(spacerDataToDesignTableData(res, dictionaryData1))
  }

  const [loading, setLoading] = React.useState(false)

  const getData = async () => {
    setLoading(true)

    try {
      await Promise.all([
        getBaseFormListData(),
        getConcreteListData(),
        getAcousticTubeListData(),
        getRebarListData(),
        getSpacerListData(),
      ])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    getData()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <div className="mb-6">
        <TableDesignData headers={baseFormHeaders} data={baseData} title="基础数据表" />
      </div>
      <div className="mb-6">
        <TableDesignData headers={concreteFormHeaders} data={concreteData} title="混凝土表" />
      </div>
      <div className="mb-6">
        <TableDesignData
          headers={acousticTubeDataFormHeaders}
          data={acousticTubeData}
          title="声测管表"
        />
      </div>
      <div className="mb-6">
        <TableDesignData headers={rebarFormHeaders} data={rebarData} title="钢筋数量表" />
      </div>

      <div className="mb-6">
        <TableDesignData headers={spacerFormHeaders} data={spacerData} title="垫块数量表" />
      </div>
    </div>
  )
}
