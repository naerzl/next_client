import React from "react"
import { Menu } from "@mui/material"
import Tree from "./Tree"
import { TypeApiGetEBSParams, TypeEBSDataList } from "@/app/ebs-data/types"
import useSWRMutation from "swr/mutation"
import { reqGetEBS } from "@/app/ebs-data/api"
import { LayoutContext } from "@/components/LayoutContext"

type Props = {
  engineeringListingId: number
  ebs_code: string
  // eslint-disable-next-line no-unused-vars
  onChecked?: (id: number) => void
}

export default function TreeSelectWithEbs(props: Props) {
  let { engineeringListingId, ebs_code, onChecked } = props
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const openMenu = Boolean(anchorEl)

  const [ebsAll, setEBSAll] = React.useState<any[]>([])

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const getEBSData = async (engineering_listing_id: number) => {
    const params: TypeApiGetEBSParams = {
      project_id: PROJECT_ID,
      is_hidden: 0,
      engineering_listing_id,
    }

    const res = await getEBSApi(params)

    let arr = res
    if (ebs_code) {
      arr = arr.filter((item) => item.code == ebs_code)
    }
    setEBSAll(arr)
    return []
  }

  React.useEffect(() => {
    engineeringListingId && getEBSData(engineeringListingId)
  }, [engineeringListingId])

  const getSubEBSData = async (ebsItem: TypeEBSDataList, pos: string, type: boolean) => {
    const ebsAllValue = structuredClone(ebsAll)

    let arr: TypeEBSDataList[] = []
    // 展开
    if (type) {
      const ebsParams = {
        project_id: PROJECT_ID,
        level: ebsItem.level + 1,
        code: ebsItem.code,
        is_hidden: 0,
        engineering_listing_id: engineeringListingId,
      } as TypeApiGetEBSParams

      arr = await getEBSApi(ebsParams)

      const indexArr = pos.split("-")
      const evalStr = `ebsAllValue[${indexArr.join("].children[")}]`

      eval(`${evalStr}.children= arr`)

      setEBSAll(ebsAllValue)
    } else {
      //   关闭
      const indexArr = pos.split("-")
      const evalStr = `ebsAllValue[${indexArr.join("].children[")}]`
      eval(`${evalStr}.children=[]`)
      setEBSAll(ebsAllValue)
    }

    return arr.length
  }

  const [nameView, setNameView] = React.useState("")

  const handleChecked = (checkedValue: number, checked: boolean, name: string) => {
    setNameView(name)
    setAnchorEl(null)
    onChecked && onChecked(checkedValue)
  }

  return (
    <div className="w-full">
      <div
        className="border h-10 w-full cursor-pointer border-[#c4c4c4] rounded flex items-center indent-3.5"
        onClick={(event) => {
          setAnchorEl(event.currentTarget)
        }}>
        {nameView ? nameView : "请选择工程结构"}
      </div>
      <Menu
        id="basic-menu"
        sx={{ zIndex: 1700 }}
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        MenuListProps={{
          "aria-labelledby": "basic-button",
          sx: { zIndex: 1700, width: "600px" },
        }}>
        <div className="max-h-[500px] overflow-y-auto w-full">
          {engineeringListingId ? (
            <Tree
              treeData={ebsAll}
              onChecked={(checkedValue, checked, name) => {
                handleChecked(checkedValue, checked, name)
              }}
              getSubEBSData={({ ebsItem, pos }, type) => {
                return getSubEBSData(ebsItem, pos, type)
              }}
            />
          ) : (
            <div className="w-full text-center text-[#ababab]">请先选择构筑物</div>
          )}
        </div>
      </Menu>
    </div>
  )
}
