"use client"
import {
  Button,
  DialogActions,
  TextField,
  InputLabel,
  Drawer,
  Autocomplete,
  Chip,
} from "@mui/material"
import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import useDebounce from "@/hooks/useDebounce"
import useSWRMutation from "swr/mutation"
import { message, TreeSelect, TreeSelectProps } from "antd"
import { ErrorMessage } from "@hookform/error-message"
import { reqGetRole, reqGetUserExisted, reqPostUser, reqPutUser } from "@/app/member-department/api"
import { REGEXP_MAIL, REGEXP_PHONE } from "@/libs/const"
import { ReqPostUserParams, RolesListData, UserListData } from "@/app/member-department/types"
import { LayoutContext } from "@/components/LayoutContext"

interface Props {
  open: boolean
  close: () => void
  // eslint-disable-next-line no-unused-vars
  cb: (item: UserListData, isAdd: boolean) => void
  class_id?: number
  item: UserListData
  isEdit: boolean
  handleEditEnd: () => void
}

const select_option = [
  {
    value: "normal",
    label: "正常",
  },
  {
    value: "forbidden",
    label: "禁用",
  },
]

type IForm = {
  name: string
  phone: string
  mail: string
}

export default function dialogUser(props: Props) {
  const { open, close, cb, isEdit, item, handleEditEnd } = props

  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: postUserApi } = useSWRMutation("/user", reqPostUser)

  const { trigger: putUserApi } = useSWRMutation("/user", reqPutUser)

  // 表单控制hooks
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
    setValue,
    getValues,
    trigger,
  } = useForm<IForm>({
    defaultValues: {
      name: "",
      phone: "",
      mail: "",
    },
  })

  const [status, setStatus] = React.useState("正常")

  const { run: onSubmit }: { run: SubmitHandler<IForm> } = useDebounce(async (values: IForm) => {
    const params = { project_id: PROJECT_ID } as ReqPostUserParams
    params.role_flags = JSON.stringify(
      sectionValue
        ? [
            ...roleSelectState.map((i) => roleOption.find((el) => el.label == i)!.value),
            sectionValue,
          ]
        : [...roleSelectState.map((i) => roleOption.find((el) => el.label == i)!.value)],
    )
    params.name = values.name
    params.phone = values.phone
    params.mail = values.mail
    const obj = select_option.find((i) => i.label == status)
    params.status = obj ? obj.value : "normal"
    if (isEdit) {
      await putUserApi(Object.assign({ unionid: item.unionid } as any, params))
      const res = structuredClone(item)
      Object.assign(res, params)
      res.roles = []
      if (roleSelectState.length > 0) {
        res.roles = roleSelectState.map((item) => {
          return {
            ...(roleOption.find((role) => role.label == item) as RolesListData),
            class: "normal",
          }
        })
      }
      treeNode.id && res.roles.push({ ...treeNode, class: "special" })
      cb(res, false)
    } else {
      const res = await postUserApi(params)
      const newRes = structuredClone(res)
      newRes.roles = []
      if (roleSelectState.length > 0) {
        newRes.roles = roleSelectState.map((item) => {
          return {
            ...(roleOption.find((role) => role.label == item) as RolesListData),
            class: "normal",
          }
        })
      }
      treeNode.id && newRes.roles.push({ ...treeNode, class: "special" })
      cb(newRes, true)
    }
    message.success("操作成功")
    handleClose()
  })

  const setFormValue = (item: UserListData) => {
    setValue("name", item.name)
    setValue("phone", item.phone)
    setValue("mail", item.mail)
    setStatus(select_option.find((el) => el.value == item.status)!.label)
    if (item.roles && item.roles.length > 0) {
      const sectionArr = item.roles.filter((item) => item.class == "special")
      setSectionValue(sectionArr.map((item) => item.name).join(""))
      const roleArr = item.roles.filter((item) => item.class == "normal")
      setRoleSelectState(roleArr.map((item) => item.name) as string[])
    }
  }

  React.useEffect(() => {
    if (isEdit) {
      setFormValue(item)
    }
  }, [isEdit])

  // 角色下拉框选项
  const [roleOption, setRoleOption] = React.useState<
    (RolesListData & { label: string; value: string })[]
  >([])

  // 部门下拉框选项
  const [sectionOption, setSectionOption] = React.useState<
    (RolesListData & { title: string; value: string; children?: any[]; isLeaf?: boolean })[]
  >([])

  const { trigger: getRoleApi } = useSWRMutation("/role", reqGetRole)

  const getRoleAndSection = async () => {
    getRoleApi({ class: "normal", project_id: PROJECT_ID }).then((roleRes) => {
      roleRes &&
        setRoleOption(roleRes.map((item) => ({ ...item, label: item.name, value: item.flag })))
    })
    getRoleApi({ class: "special", project_id: PROJECT_ID }).then((sectionRes) => {
      sectionRes &&
        setSectionOption(
          sectionRes.map((item) => ({ ...item, title: item.name, value: item.flag })),
        )
    })
  }

  React.useEffect(() => {
    open && getRoleAndSection()
  }, [open])

  // 关闭弹窗 重置表单数据
  const handleClose = () => {
    close()
    reset()
    handleEditEnd()
    setSectionValue("")
    setTreeNode({})
    setRoleSelectState([])
  }

  const { trigger: getUserExistedApi } = useSWRMutation("/user/existed", reqGetUserExisted)

  const onPhoneChange = () => {
    let phone = getValues("phone")
    if (REGEXP_PHONE.test(phone)) {
      // getUserExistedApi({ phone }).then((res) => {
      //   setFormValue(res)
      // })
    }
  }

  const [sectionValue, setSectionValue] = React.useState<string>()

  const onLoadData: TreeSelectProps["loadData"] = (node) => {
    return new Promise(async (resolve) => {
      console.log(node)
      const { id, pos } = node
      const res = await getRoleApi({ class: "special", parent_id: id, project_id: PROJECT_ID })
      const reslut = res.map((item) => ({ ...item, title: item.name, value: item.flag }))
      const indexArr = pos.split("-")
      indexArr.splice(0, 1)
      const newArr = structuredClone(sectionOption)
      const str = "newArr[" + indexArr.join("].children[") + "].children"
      console.log(reslut, indexArr, str)
      eval(str + "=reslut")
      setSectionOption(newArr)
      resolve(undefined)
    })
  }

  const [treeNode, setTreeNode] = React.useState<any>({})

  // 处理部门下拉选择框的修改时间
  const handleSectionSelectChange = (newValue: string, node: any) => {
    setTreeNode(node)
    setSectionValue(newValue)
  }

  const [roleSelectState, setRoleSelectState] = React.useState<string[]>([])

  return (
    <Drawer open={open} onClose={handleClose} anchor="right">
      <div className="w-[500px] p-10">
        <header className="text-3xl text-[#44566C] mb-8">{isEdit ? "编辑用户" : "添加用户"}</header>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="phone" className="mr-3 w-20 text-left mb-2.5" required>
                手机号:
              </InputLabel>
              <TextField
                disabled={isEdit}
                variant="outlined"
                id="phone"
                size="small"
                fullWidth
                error={Boolean(errors.phone)}
                {...register("phone", {
                  required: "请输入手机号",
                  pattern: {
                    value: REGEXP_PHONE,
                    message: "手机号格式不正确",
                  },
                  onChange: onPhoneChange,
                  onBlur() {
                    trigger("phone")
                  },
                })}
                label="请输入手机号"
                autoComplete="off"
                className="flex-1"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="phone"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="name" className="mr-3 w-20 text-left mb-2.5" required>
                名称:
              </InputLabel>
              <TextField
                variant="outlined"
                id="name"
                size="small"
                fullWidth
                disabled={isEdit}
                error={Boolean(errors.name)}
                {...register("name", {
                  required: "请输入名称",
                  maxLength: {
                    value: 16,
                    message: "文本字数最多16个",
                  },
                  onBlur() {
                    trigger("name")
                  },
                })}
                label="请输入名称"
                autoComplete="off"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="status" className="mr-3 w-20 text-left mb-2.5" required>
                状态:
              </InputLabel>

              <Autocomplete
                disablePortal
                id="h_subpart_code"
                options={select_option.map((item) => item.label)}
                fullWidth
                value={status}
                size="small"
                onChange={(event, value, reason, details) => {
                  setStatus(value ?? "")
                }}
                renderInput={(params) => <TextField {...params} label="请选择用户状态" />}
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
          </div>

          <div className="mb-8 relative">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="mail" className="mr-3 w-20 text-left mb-2.5">
                邮箱:
              </InputLabel>
              <TextField
                variant="outlined"
                id="mail"
                size="small"
                fullWidth
                error={Boolean(errors.mail)}
                {...register("mail", {
                  pattern: { value: REGEXP_MAIL, message: "邮箱格式不正确" },

                  onBlur() {
                    trigger("mail")
                  },
                })}
                label="请输入邮箱"
                autoComplete="off"
                className="flex-1"
              />
            </div>
            <ErrorMessage
              errors={errors}
              name="mail"
              render={({ message }) => (
                <p className="text-railway_error text-sm absolute">{message}</p>
              )}
            />
          </div>

          <div className="mb-8">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="role_list" className="mr-3 w-20 text-left mb-2.5">
                角色:
              </InputLabel>

              <Autocomplete
                disablePortal
                id="h_subpart_code"
                options={roleOption.map((item) => item.label)}
                fullWidth
                value={roleSelectState}
                multiple
                size="small"
                onChange={(event, value, reason, details) => {
                  setRoleSelectState(value)
                }}
                renderInput={(params) => <TextField {...params} label="请选择关联的角色" />}
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
          </div>

          <div className="mb-8">
            <div className="flex items-start flex-col">
              <InputLabel htmlFor="section_list" className="mr-3 w-20 text-left mb-2.5">
                部门:
              </InputLabel>
              <TreeSelect
                placement="topLeft"
                style={{ width: "100%" }}
                value={sectionValue}
                dropdownStyle={{ maxHeight: 400, overflow: "auto", zIndex: 2000 }}
                placeholder="选择一个部门"
                onSelect={handleSectionSelectChange}
                loadData={onLoadData}
                size="large"
                treeData={sectionOption}
              />
            </div>
          </div>

          <DialogActions>
            <Button onClick={handleClose}>取消</Button>
            <Button type="submit" variant="contained" className="bg-railway_blue">
              确定
            </Button>
          </DialogActions>
        </form>
      </div>
    </Drawer>
  )
}
