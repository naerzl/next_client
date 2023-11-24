import { Button, Drawer } from "@mui/material"
import React from "react"
import { TestDataList } from "@/app/test/types"
import { dateToYYYYMM } from "@/libs/methods"
import { MaterialProcessingData } from "@/app/material-processing/types"
import {
  CLASS_OPTION,
  LINK_METHOD_OPTION,
  subConcreteDictionaryClass,
} from "@/app/material-processing/const"
import useSWRMutation from "swr/mutation"
import { reqGetDictionary } from "@/app/gantt/api"
import { DictionaryData } from "@/app/gantt/types"

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  close: () => void
  editItem: null | MaterialProcessingData
}

function findTitle(str: string) {
  let title = "查看详情"
  const testItem = CLASS_OPTION.find((item) => item.value == str)
  if (testItem) title += `--${testItem.label}`
  return title
}

function findRebarLinkMethod(val: string) {
  const item = LINK_METHOD_OPTION.find((item) => item.value == val)

  return item ? item.label : val
}

export default function LookDetail(props: Props) {
  const { open, close, editItem } = props

  const [dataSets, setDataSets] = React.useState<any>({})

  const { trigger: getDictionaryApi } = useSWRMutation("/dictionary", reqGetDictionary)

  const [dictionary, setDictionary] = React.useState<DictionaryData[]>([])

  const getDictionaryListData = async () => {
    const res = await getDictionaryApi({})
    setDictionary(res)
  }

  React.useEffect(() => {
    getDictionaryListData()
  }, [])

  React.useEffect(() => {
    if (!!editItem) {
      console.log(JSON.parse(editItem.relate_data))
      setDataSets(JSON.parse(editItem.relate_data))
    }
  }, [editItem])

  const handleClose = () => {
    close()
  }

  const renderRebar = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">拉伸试验</h3>
          {dataSets?.materials?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">物料类型:</b>
                  <span className="font-bold text-railway_303">
                    {subConcreteDictionaryClass.find((el) => el.value == item.class)?.label}
                  </span>
                </li>

                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">物料名称:</b>
                  <span className="font-bold text-railway_303">
                    {dictionary.find((el) => el.id == item.dictionary_id)?.name}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">数量:</b>
                  <span className="font-bold text-railway_303">
                    {item.quantity}
                    {subConcreteDictionaryClass.find((el) => el.value == item.class)?.unit}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">基础数据</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">下料人员:</b>
              <span className="font-bold text-railway_303">{dataSets?.blanking_personnel}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">焊接员:</b>
              <span className="font-bold text-railway_303">{dataSets?.welder}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">加工员:</b>
              <span className="font-bold text-railway_303">{dataSets?.processors}</span>
            </li>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">连接方式:</b>
              <span className="font-bold text-railway_303">
                {findRebarLinkMethod(dataSets?.link_type)}
              </span>
            </li>
          </ul>
        </div>
      </div>
    )
  }
  const renderConcrete = () => {
    return (
      <div>
        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">物料</h3>
          {dataSets?.materials?.map((item: any, index: number) => (
            <div key={index}>
              <ul>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">物料类型:</b>
                  <span className="font-bold text-railway_303">
                    {subConcreteDictionaryClass.find((el) => el.value == item.class)?.label}
                  </span>
                </li>

                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">物料名称:</b>
                  <span className="font-bold text-railway_303">
                    {dictionary.find((el) => el.id == item.dictionary_id)?.name}
                  </span>
                </li>
                <li className="mt-1.5">
                  <b className="mr-1.5 text-railway_gray">数量:</b>
                  <span className="font-bold text-railway_303">
                    {item.quantity}
                    {subConcreteDictionaryClass.find((el) => el.value == item.class)?.unit}
                  </span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-5 shadow p-2.5">
          <h3 className="text-xl font-bold mb-3">基础数据</h3>
          <ul>
            <li className="mt-1.5">
              <b className="mr-1.5 text-railway_gray">拌合员:</b>
              <span className="font-bold text-railway_303">{dataSets?.mixer}</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  const renderDetail = () => {
    switch (editItem!.class) {
      case "rebar":
        return renderRebar()
      case "concrete":
        return renderConcrete()
      default:
        return <></>
    }
  }

  return (
    <Drawer open={open} onClose={handleClose} anchor="right">
      <div className="w-[700px] p-10 relative">
        <header className="text-3xl text-[#44566C] mb-8 sticky top-0 bg-white py-4">
          {findTitle(editItem!.class)}
        </header>
        <div>{renderDetail()}</div>
        <div>
          <Button onClick={handleClose}>关闭</Button>
        </div>
      </div>
    </Drawer>
  )
}
