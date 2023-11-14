import React, { ReactNode } from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import useSWRMutation from "swr/mutation"
import { reqDeleteEBS, reqGetEBS, reqPostEBS } from "@/app/ebs-data/api"
import EBSDataContext from "@/app/ebs-data/context/ebsDataContext"
import { useSearchParams } from "next/navigation"
import useHooksConfirm from "@/hooks/useHooksConfirm"
import { useConfirmationDialog } from "@/components/ConfirmationDialogProvider"
import RefreshIcon from "@mui/icons-material/Refresh"
import { LayoutContext } from "@/components/LayoutContext"
import useDrawerProcess from "@/app/ebs-data/hooks/useDrawerProcess"

interface Props {
  item: TypeEBSDataList
  children?: ReactNode
  // eslint-disable-next-line no-unused-vars
  handleGetParentChildren: (parentIndexArr: string[]) => void
  handleAddEBS: (
    item: TypeEBSDataList,
    delDataList: TypeEBSDataList[],
    type: Type_Is_system,
  ) => void
  handleAddCustomEBS: (item: TypeEBSDataList, type: Type_Is_system) => void
  handleEditCustomEBS: (item: TypeEBSDataList) => void
  isLastOne: boolean
  handleOpenDrawerProcess: (item: TypeEBSDataList) => void
}

const EnumSubpartClass: { [key: string]: string } = {
  field: "专业",
  subpart: "分部",
  subitem: "分项",
}

export type Type_Is_system = "platform" | "system" | "userdefined"

function TableTr(props: Props) {
  const ctx = React.useContext(EBSDataContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const {
    item,
    handleGetParentChildren,
    handleAddEBS,
    handleAddCustomEBS,
    handleEditCustomEBS,
    isLastOne,
    handleOpenDrawerProcess,
  } = props

  const searchParams = useSearchParams()
  // 删除EBS结构api
  const { trigger: deleteEBSApi } = useSWRMutation("/ebs", reqDeleteEBS)

  // 获取被删除的EBS结构的数据
  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  // 获取被删除的EBS结构的数据
  const { trigger: postEBSApi } = useSWRMutation("/ebs", reqPostEBS)

  const { showConfirmationDialog } = useConfirmationDialog()

  // 处理单元格添加按钮
  const handleTdCellAdd = async () => {
    const res = await getEBSApi({
      project_id: PROJECT_ID,
      code: item.code,
      is_hidden: 1,
      level: item.level + 1,
      engineering_listing_id: Number(searchParams.get("baseId")),
    })
    handleAddEBS(item, res || [], "system")
  }

  // 处理单元格修改按钮
  const handleTdCellEdit = async () => {
    handleEditCustomEBS(item)
  }

  // 处理单元格删除按钮
  const handleTdCellDelete = () => {
    showConfirmationDialog("确认删除吗？", async () => {
      await deleteEBSApi({
        id: item.id,
        project_id: PROJECT_ID,
        engineering_listing_id: Number(searchParams.get("baseId")),
      })
      //   删除成功需要刷新父级节点下面的children
      const parentIndexArr = item.key?.split("-").slice(0, item.key?.split("-").length - 1)

      console.log(parentIndexArr)
      //   获取父级节点的层级 拿到当前的层级删除最后一个 即是父级层级
      handleGetParentChildren(parentIndexArr as string[])
    })
  }

  // 处理单元格添加自定义
  const handleTdCellAddCustom = async () => {
    handleAddCustomEBS(item, "userdefined")
  }

  // 菜单选项
  const [items, setItems] = React.useState([
    {
      label: "添加",
      key: "2",
      async onClick() {
        const res = await getEBSApi({
          project_id: PROJECT_ID,
          code: item.code,
          is_hidden: 1,
          level: item.level + 1,
        })
        handleAddEBS(item, res || [], "system")
      },
    },
    {
      key: "3",
      label: "修改",
      onClick() {
        handleEditCustomEBS(item)
      },
    },
    {
      label: "删除",
      key: "4",
      async onClick() {
        // 调佣删除接口
        await deleteEBSApi({
          id: item.id,
          project_id: PROJECT_ID,
          engineering_listing_id: Number(searchParams.get("baseId")),
        })
        //   删除成功需要刷新父级节点下面的children
        const parentIndexArr = item.key?.split("-").slice(0, item.key?.split("-").length - 1)
        //   获取父级节点的层级 拿到当前的层级删除最后一个 即是父级层级
        handleGetParentChildren(parentIndexArr as string[])
      },
    },
    {
      label: "添加自定义",
      key: "5",
      onClick() {
        handleAddCustomEBS(item, "userdefined")
      },
    },
  ])

  // 需要通过数据里面的 is_loop字段判断是否有复制按钮
  const filterItemsOfMenu = async (
    is_loop: string,
    is_system: "platform" | "system" | "userdefined" | "null",
  ) => {
    // 通过是否可循环判断 是否该存在复制按钮
    const havaLoopArr = is_loop == "no" ? items!.filter((item) => item!.key !== "1") : items

    // 通过item的类型判断是否 该存在修改按钮
    const havaSystemArr =
      is_system == "userdefined" ? havaLoopArr : havaLoopArr!.filter((item) => item!.key !== "3")

    // 获取当前节点下面是否有子节点
    const res = await getEBSApi({
      project_id: PROJECT_ID,
      level: item.level + 1,
      code: item.code,
    })

    const parentIndexArr = item.key
      ?.split("-")
      .slice(0, item.key?.split("-").length - 1) as string[]

    if (parentIndexArr.length == 0)
      return setItems(havaSystemArr?.filter((item) => item!.key != "5"))

    const parentItem = eval(`ctx.tableData[${parentIndexArr.join("].children[")}]`)

    // 判断 过滤掉5 的菜单
    const resArrNo5 =
      // 如果没有任何数据 且当前类型不是 自定义 （即系统最后一级）
      (res.length == 0 && is_system == "system") ||
      //   如果当前节点类型为自定义 且 父级类型不为自定义 （即第一层自定义）
      (is_system == "userdefined" && parentItem.is_system != "userdefined") ||
      //   如果 有有子集 且子集元素 是自定义
      (res.length > 0 && res[0].class == "userdefined")
        ? havaSystemArr
        : havaSystemArr!.filter((item) => item!.key != "5")

    const resNo2 =
      (res.length > 0 && res[0].class == "userdefined") ||
      is_system == "userdefined" ||
      res.length == 0
        ? resArrNo5?.filter((item) => item!.key != "2")
        : resArrNo5

    setItems(resNo2)
  }

  const [have2, setHave2] = React.useState(true)
  const [have5, setHave5] = React.useState(true)
  const [iconLoading, setIconLoading] = React.useState(true)

  const initHave2and5 = async () => {
    setIconLoading(true)
    // 计算当前项的子集还有没有数据
    // let count = 0
    // if (item.childrenCount) {
    //   for (const key in item.childrenCount) {
    //     // @ts-ignore
    //     count += item.childrenCount[key]
    //   }
    //   if (count <= 0) {
    //     setHaveChildren(false)
    //   }
    //   if (item.children!.length > 0) {
    //     setHaveChildren(true)
    //   }
    // }

    const parentIndexArr = item.key
      ?.split("-")
      .slice(0, item.key?.split("-").length - 1) as string[]

    if (parentIndexArr.length == 0) return setHave5(false)

    const parentItem = eval(`ctx.tableData[${parentIndexArr.join("].children[")}]`)

    // setHave2(item.class == "system" && count > 0 && item.childrenCount?.userdefined == 0)
    //
    // setHave5(
    //   (item.class != "userdefined" && count == 0) ||
    //     (count > 0 && item.childrenCount!.userdefined > 0) ||
    //     (item.class == "userdefined" && parentItem.class != "userdefined"),
    // )
  }

  React.useEffect(() => {
    initHave2and5().then(() => {
      setTimeout(() => {
        setIconLoading(false)
      }, 1000)
    })
  }, [item.children?.length])

  const [emptyChildren, setEmptyChildren] = React.useState<number[]>([])

  // 点击 字体图片展开功能
  const handleClick = async () => {
    const res = await ctx.handleExpandChange(true, item)
    // console.log(res)
    if (res <= 0) {
      setEmptyChildren((prevState) => [...prevState, item.id])
    } else {
      setEmptyChildren((prevState) => prevState.filter((id) => id != item.id))
    }
  }

  // 点击 字体图片关闭功能
  const handleClickClose = () => {
    ctx.handleExpandChange(false, item)
  }

  // 右键唤醒菜单事件
  const handleClickContextMenu = (
    event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>,
  ) => {
    event.preventDefault()
  }

  const handleCLickCell = () => {
    if (item.name.includes("桩") && item.is_can_select != 1) {
      handleOpenDrawerProcess(item)

      ctx.changeEBSItem(
        Object.assign(item, { engineering_listing_id: Number(searchParams.get("baseId")) }),
      )
    }
  }

  const renderName = (): string => {
    let name = item.extend && item.extend.name ? item.extend.name : item.name
    if (item.is_loop) {
      name += `[${name}仅作为基础的工程结构模板，所有墩的工程结构基于此创建，已创建的墩不受影响。]`
    }
    return name
  }
  return (
    <>
      <tr className="h-14 grid grid-cols-6">
        <td
          className="border p-4 overflow-hidden cursor-pointer col-span-3 flex justify-between"
          title={renderName()}
          onContextMenu={(event) => {
            handleClickContextMenu(event)
          }}>
          <div
            className="flex-1 flex flex-shrink-0  overflow-hidden"
            style={{ textIndent: `${(item.level - 1) * 10}px` }}>
            {emptyChildren.includes(item.id) ? (
              <i
                className="iconfont  icon-shuaxin  text-[14px] font-bold mr-1.5"
                onClick={() => {
                  handleClick()
                }}></i>
            ) : props.children ? (
              <i
                className="iconfont  icon-xiangxiajiantou  text-[14px] font-bold mr-1.5"
                onClick={() => {
                  handleClickClose()
                }}></i>
            ) : (
              <i
                className="iconfont icon-xiangyoujiantou text-[14px] font-bold mr-1.5"
                onClick={() => {
                  handleClick()
                }}></i>
            )}

            <span
              className="overflow-hidden text-ellipsis whitespace-nowrap w-full"
              style={{ textIndent: 0 }}
              onClick={() => {
                handleCLickCell()
              }}>
              {renderName()}
            </span>
          </div>

          {
            <div className="text-[#6d6e6f] flex gap-x-2.5 w-[6.25rem] justify-end">
              {item.is_can_select == 1 && (
                <i
                  className="iconfont icon-appstoreadd w-4 aspect-square"
                  title="添加"
                  onClick={() => {
                    handleTdCellAddCustom()
                  }}></i>
              )}
              {have2 && (
                <i
                  className="iconfont icon-jia w-4 aspect-square"
                  title="添加已删除EBS"
                  onClick={() => {
                    handleTdCellAdd()
                  }}></i>
              )}

              {!item.is_loop && (
                <i
                  className="iconfont icon-bianji w-4 aspect-square"
                  title="修改"
                  onClick={() => {
                    handleTdCellEdit()
                  }}></i>
              )}

              {item.level > 1 && (
                <i
                  className="iconfont icon-shanchu w-4 aspect-square"
                  title="删除"
                  onClick={() => {
                    handleTdCellDelete()
                  }}></i>
              )}
            </div>
          }
        </td>
        <td
          className="border p-4 whitespace-nowrap text-ellipsis overflow-hidden"
          title={item.code}>
          {item.code}
        </td>
        <td className="border p-4">{item.unit}</td>
        <td className="border p-4">
          {
            EnumSubpartClass[
              searchParams.get("type") == "1"
                ? item.h_subpart_code_class
                : item.n_subpart_code_class
            ]
          }
        </td>
      </tr>
      {props.children}
    </>
  )
}

export default TableTr
