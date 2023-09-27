import React from "react"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import useDebounce from "@/hooks/useDebounce"
import useSWRMutation from "swr/mutation"
import { reqPostEBS, reqPutEBS } from "@/app/ebs-data/api"
import EBSDataContext from "@/app/ebs-data/context/ebsDataContext"
import { Type_Is_system } from "@/app/ebs-data/components/TableTr"
import { PROJECT_ID } from "@/libs/const"
import {
  Autocomplete,
  Button,
  Chip,
  DialogActions,
  Drawer,
  InputLabel,
  TextField,
} from "@mui/material"
import { ErrorMessage } from "@hookform/error-message"
import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"

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
function DialogEBS(props: Props) {
  const ctx = React.useContext(EBSDataContext)
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
  const { trigger: putEBSApi } = useSWRMutation("/ebs", reqPutEBS)

  const [ebsNode, setEBSNode] = React.useState<string | null>(null)

  // 表单控制hooks
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
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
        is_copy: 0,
        ebs_id: item.id,
        next_ebs_id: obj?.id,
        project_id: PROJECT_ID,
        is_system: "system",
        project_si_id: Number(searchParams.get("si")),
        project_sp_id: Number(searchParams.get("sp")),
      })
      ctx.handleExpandChange(true, item)
    } else if (addType == "userdefined") {
      if (isEdit) {
        await putEBSApi({ name: value.name, id: item.id, project_id: PROJECT_ID })
        const parentIndexArr = item.key?.split("-").slice(0, item.key?.split("-").length - 1)
        handleGetParentChildren(parentIndexArr as string[])
      } else {
        await postEBSApi({
          is_copy: 0,
          ebs_id: item.id,
          name: value.name,
          project_id: PROJECT_ID,
          is_system: "userdefined",
          project_si_id: Number(searchParams.get("si")),
          project_sp_id: Number(searchParams.get("sp")),
        })
        ctx.handleExpandChange(true, item)
      }
    }
    handleCancel()
  })

  React.useEffect(() => {
    isEdit && setValue("name", item.name)
  }, [isEdit])

  //  系统添加的 表单
  const SystemForm = () => (
    <form onSubmit={handleSubmit(onFinish)}>
      <div className="mb-8">
        <div className="flex items-start flex-col">
          <InputLabel htmlFor="name" className="mr-3 mb-2.5 w-24 text-left inline-block">
            EBS节点:
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
            renderInput={(params) => <TextField {...params} label="请选择EBS" />}
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
      <div className="mb-8">
        <div className="flex items-start flex-col">
          <InputLabel htmlFor="name" className="mr-3 mb-2.5 w-24 text-left inline-block">
            EBS名称:
          </InputLabel>
          <TextField
            id="name"
            size="small"
            fullWidth
            error={Boolean(errors.name)}
            variant="outlined"
            label="EBS名称"
            className="flex-1"
            {...register("name", { required: "EBS名称" })}
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
          <header className="text-3xl text-[#44566C] mb-8">{isEdit ? "修改" : "添加"}</header>
          {renderForm()}
        </div>
      </Drawer>
    </>
  )
}

export default DialogEBS
