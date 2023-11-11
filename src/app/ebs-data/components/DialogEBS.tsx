import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import useDebounce from "@/hooks/useDebounce"
import useSWRMutation from "swr/mutation"
import { reqGetEBS, reqPostEBS, reqPutEBS } from "@/app/ebs-data/api"
import EBSDataContext from "@/app/ebs-data/context/ebsDataContext"
import { Type_Is_system } from "@/app/ebs-data/components/TableTr"
import {
  Autocomplete,
  Button,
  Chip,
  DialogActions,
  Drawer,
  IconButton,
  InputLabel,
  TextField,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { LayoutContext } from "@/components/LayoutContext"
import Tooltip from "@mui/material/Tooltip"

interface Props {
  open: boolean
  item: TypeEBSDataList
  // eslint-disable-next-line no-unused-vars
  changeDialogOpen: (open: boolean) => void
  deletedDataList: TypeEBSDataList[]
  addType: Type_Is_system
  isEdit: boolean
  // eslint-disable-next-line no-unused-vars
  changeIsEdit: (edit: boolean) => void
  // eslint-disable-next-line no-unused-vars
  handleGetParentChildren: (parentIndexArr: string[]) => void
}
export default function DialogEBS(props: Props) {
  const ctx = React.useContext(EBSDataContext)

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const {
    open,
    item,
    changeDialogOpen,
    deletedDataList,
    addType,
    isEdit,
    changeIsEdit,
    handleGetParentChildren,
  } = props

  const searchParams = useSearchParams()

  const { trigger: postEBSApi } = useSWRMutation("/ebs", reqPostEBS)
  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)
  const { trigger: putEBSApi } = useSWRMutation("/ebs", reqPutEBS)

  const [length, setLength] = React.useState(1)
  const [lastOne, setLaseOne] = React.useState<TypeEBSDataList | null>(null)

  const findTitle = (type: "label" | "placeholder") => {
    let title = ""

    const titleEnum = ["墩", "桩"]

    let titleType: string | undefined = ""
    if (lastOne) {
      titleType = titleEnum.find((str) => lastOne.name.includes(str))
      // title = lastOne.name.replace("N", "0") + `~结束${titleType}号`
      title = `结束${titleType}号`
    }
    if (type == "label") {
      return title
    } else {
      return `请输入结束${titleType}号，最大数字为10`
    }
  }
  const getEBSData = async () => {
    const res = await getEBSApi({
      code: item.code,
      project_id: PROJECT_ID,
      level: item.level + 1,
      is_hidden: 0,
      engineering_listing_id: Number(searchParams.get("baseId")),
    })
    if (res.length > 1) {
      setLength(parseInt(res[res.length - 1].name) + 10)
      setLaseOne(res[res.length - 1])
    } else {
      setLength(10)
      setLaseOne(res[res.length - 1])
    }
  }

  React.useEffect(() => {
    getEBSData()
  }, [])

  const [ebsNode, setEBSNode] = React.useState<string | null>(null)

  // 表单控制hooks
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({})

  // 弹窗取消事件
  const handleCancel = () => {
    reset()
    changeDialogOpen(false)
    changeIsEdit(false)
    setEBSNode(null)
  }

  // 提交表单事件（防抖）
  const { run: onFinish } = useDebounce(async (value: any) => {
    if (addType == "system") {
      if (!ebsNode) return
      const obj = deletedDataList.find((i) => i.name == ebsNode)

      await postEBSApi({
        ebs_id: item.id,
        project_id: PROJECT_ID,
        engineering_listing_id: Number(searchParams.get("baseId")),
        end_position: 1,
      })
      ctx.handleExpandChange(true, item)
    } else if (addType == "userdefined") {
      if (isEdit) {
        await putEBSApi({
          name: value.name,
          id: item.id,
          project_id: PROJECT_ID,
          engineering_listing_id: Number(searchParams.get("baseId")),
        })
        const parentIndexArr = item.key?.split("-").slice(0, item.key?.split("-").length - 1)
        handleGetParentChildren(parentIndexArr as string[])
      } else {
        await postEBSApi({
          ebs_id: item.id,
          project_id: PROJECT_ID,
          engineering_listing_id: Number(searchParams.get("baseId")),
          end_position: value.end_position,
        })
        ctx.handleExpandChange(true, item)
      }
    }
    handleCancel()
  })

  React.useEffect(() => {
    isEdit && setValue("name", item.extend && item.extend.name ? item.extend.name : item.name)
  }, [isEdit])

  //  系统添加的 表单
  const SystemForm = () => (
    <form onSubmit={handleSubmit(onFinish)}>
      <div className="mb-8">
        <div className="flex items-start flex-col">
          <InputLabel htmlFor="name" className="mr-3 mb-2.5 w-24 text-left inline-block">
            工程结构:
          </InputLabel>
          <Autocomplete
            disablePortal
            id="h_subpart_code"
            options={deletedDataList.map((item) => item.name)}
            fullWidth
            value={ebsNode}
            size="small"
            onChange={(event, value) => {
              setEBSNode(value)
            }}
            renderInput={(params) => <TextField {...params} label="请选择工程结构" />}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option}>
                  {option}
                </li>
              )
            }}
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option} label={option} />
              ))
            }}
          />
        </div>
        <ErrorMessage
          errors={errors}
          name="name"
          render={({ message }) => <p className="text-railway_error text-sm pl-24">{message}</p>}
        />
      </div>
      <DialogActions>
        <Button onClick={handleCancel}>取消</Button>
        <Button type="submit" variant="contained" className="bg-railway_blue">
          确定
        </Button>
      </DialogActions>
    </form>
  )

  const CustomForm = () => (
    <form onSubmit={handleSubmit(onFinish)}>
      {addType == "userdefined" && !isEdit && (
        <div className="mb-8">
          <div className="flex items-start flex-col">
            <InputLabel
              htmlFor="end_position"
              className="mr-3 mb-2.5 w-full text-left inline-block">
              <span className="font-bold">{findTitle("label")}</span>
              <Tooltip title="计算规则：输入数字为该工程结构的总数。">
                <i className="iconfont icon-wenhao-xianxingyuankuang cursor-pointer"></i>
              </Tooltip>
            </InputLabel>
            <TextField
              id="end_position"
              size="small"
              fullWidth
              placeholder={`${findTitle("placeholder")}号`}
              error={Boolean(errors.end_position)}
              variant="outlined"
              className="flex-1"
              {...register("end_position", {
                required: `请输入${findTitle("placeholder")}号`,
                max: { value: length, message: `最大为${length}` },
                onBlur() {
                  trigger("end_position")
                },
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="end_position"
            render={({ message }) => <p className="text-railway_error text-sm">{message}</p>}
          />
        </div>
      )}

      {addType == "userdefined" && isEdit && (
        <div className="mb-8">
          <div className="flex items-start flex-col">
            <InputLabel
              htmlFor="end_position"
              className="mr-3 mb-2.5 w-full text-left inline-block">
              <span className="font-bold">工程结构名称：</span>
            </InputLabel>
            <TextField
              id="end_position"
              size="small"
              fullWidth
              error={Boolean(errors.name)}
              variant="outlined"
              label="工程结构名称"
              className="flex-1"
              {...register("name", {
                required: "请输入工程结构名称",
                onBlur() {
                  trigger("name")
                },
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="name"
            render={({ message }) => <p className="text-railway_error text-sm">{message}</p>}
          />
        </div>
      )}
      <DialogActions>
        <Button onClick={handleCancel}>取消</Button>
        <Button type="submit" variant="contained" className="bg-railway_blue">
          确定
        </Button>
      </DialogActions>
    </form>
  )
  const renderForm = () => {
    switch (addType) {
      case "platform":
        return <></>
      case "system":
        return SystemForm()
      case "userdefined":
        return CustomForm()
    }
  }

  return (
    <>
      <Drawer open={open} onClose={handleCancel} anchor="right">
        <div className="w-[500px] p-10">
          <header className="text-3xl text-[#44566C] mb-8">
            {isEdit ? "修改工程结构" : "添加工程结构"}
          </header>
          {renderForm()}
        </div>
      </Drawer>
    </>
  )
}
