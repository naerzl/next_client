"use client"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  InputLabel,
  TextField,
} from "@mui/material"
import React from "react"
import useDebounce from "@/hooks/useDebounce"
import useSWRMutation from "swr/mutation"
import { useForm, SubmitHandler } from "react-hook-form"
import { ErrorMessage } from "@hookform/error-message"
import { message } from "antd"
import memberDepartmentContext from "@/app/member-department/context/memberDepartmentContext"
import { reqPostRole, reqPutRole } from "@/app/member-department/api"
import { ReqPostRolesParams, RolesListData } from "@/app/member-department/types"
import { PROJECT_ID } from "@/libs/const"

interface Props {
  open: boolean
  close: () => void
  parent_id?: number | undefined
  // eslint-disable-next-line no-unused-vars
  getSubClassList?: (id: number) => void
  // eslint-disable-next-line no-unused-vars
  cb: (item: RolesListData) => void
  editItem: undefined | RolesListData
  setEditItem: React.Dispatch<React.SetStateAction<any | undefined>>
}

export default function dialogSideBar(props: Props) {
  const ctx = React.useContext(memberDepartmentContext)
  const { open, close, parent_id, cb, editItem, setEditItem } = props

  // 表单控制hooks
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ReqPostRolesParams>({})

  React.useEffect(() => {
    if (editItem) {
      setValue("name", editItem.name)
      setValue("desc", editItem.desc)
    }
  }, [editItem])

  const { trigger: postRoleApi } = useSWRMutation("/role", reqPostRole)

  const { trigger: putRoleApi } = useSWRMutation("/role", reqPutRole)

  // 表单提交事件
  const { run: onSubmit }: { run: SubmitHandler<ReqPostRolesParams> } = useDebounce(
    async (values: ReqPostRolesParams) => {
      // 拼接出请求需要的参数
      if (editItem) {
        const res = await putRoleApi({ ...values, id: editItem.id, project_id: PROJECT_ID })
        cb(res)
      } else {
        let params = { project_id: PROJECT_ID } as ReqPostRolesParams
        Object.assign(params, values)
        if (parent_id) {
          params.parent_id = parent_id
        }
        const res = await postRoleApi(params)
        cb(res)
      }

      message.success("操作成功")
      // 重新获取侧边分类
      // 如果有父类id则获取子集分类
      handleClose()
    },
  )

  // 关闭弹窗
  const handleClose = () => {
    close()
    reset()
    setEditItem(undefined)
  }

  return (
    <Drawer open={open} onClose={handleClose} anchor="right">
      <div className="w-[500px] p-10">
        <header className="text-3xl text-[#44566C] mb-8">
          {editItem ? "修改部门" : "添加部门"}
        </header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 mb-2.5 w-24 text-left inline-block">
                部门名称:
              </InputLabel>
              <TextField
                id="name"
                size="small"
                fullWidth
                error={Boolean(errors.name)}
                variant="outlined"
                label="部门名称"
                className="flex-1"
                {...register("name", {
                  required: "部门名称",
                  maxLength: {
                    value: 16,
                    message: "文本字数最多16个",
                  },
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

          <div className="mb-8">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="desc" className="mr-3  mb-2.5 w-24 text-left inline-block">
                部门备注:
              </InputLabel>
              <TextField
                id="desc"
                size="small"
                fullWidth
                error={Boolean(errors.desc)}
                variant="outlined"
                label="部门备注"
                className="flex-1"
                {...register("desc", {
                  maxLength: {
                    value: 16,
                    message: "文本字数最多16个",
                  },
                  onBlur() {
                    trigger("desc")
                  },
                })}
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="desc"
              render={({ message }) => <p className="text-railway_error text-sm">{message}</p>}
            />
          </div>
          <DialogActions>
            <Button onClick={handleClose}>取消</Button>
            <Button type="submit">确定</Button>
          </DialogActions>
        </form>
      </div>
    </Drawer>
  )
}
