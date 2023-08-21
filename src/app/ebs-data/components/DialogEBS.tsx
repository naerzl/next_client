import React from "react"
import { Button, Form, Input, message, Modal, Select } from "antd"
import { TypeEBSDataList } from "@/app/ebs-data/types"
import useDebounce from "@/hooks/useDebounce"
import useSWRMutation from "swr/mutation"
import { reqPostEBS, reqPutEBS } from "@/app/ebs-data/api"
import EBSDataContext from "@/app/ebs-data/context/ebsDataContext"
import { Type_Is_system } from "@/app/ebs-data/components/TableTr"

interface Props {
  open: boolean
  item: TypeEBSDataList
  changeDialogOpen: (open: boolean) => void
  deletedDataList: TypeEBSDataList[]
  addType: Type_Is_system
  isEdit: boolean
  changeIsEdit: (edit: boolean) => void
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
  const { trigger: postEBSApi } = useSWRMutation("/ebs", reqPostEBS)
  const { trigger: putEBSApi } = useSWRMutation("/ebs", reqPutEBS)

  const [form] = Form.useForm()
  // 弹窗取消事件
  const handleCancel = () => {
    form.resetFields()
    changeDialogOpen(false)
    changeIsEdit(false)
  }

  // 提交表单事件（防抖）
  const { run: onFinish } = useDebounce(async (value: any) => {
    if (addType == "system") {
      await postEBSApi({
        is_copy: 0,
        ebs_id: item.id,
        next_ebs_id: value!.next_ebs_id,
        project_id: 1,
        is_system: "system",
      })
      ctx.handleExpandChange(true, item)
    } else if (addType == "userdefined") {
      if (isEdit) {
        await putEBSApi({ name: value.name, id: item.id })
        const parentIndexArr = item.key?.split("-").slice(0, item.key?.split("-").length - 1)
        handleGetParentChildren(parentIndexArr as string[])
      } else {
        await postEBSApi({
          is_copy: 0,
          ebs_id: item.id,
          name: value.name,
          project_id: 1,
          is_system: "userdefined",
        })
        ctx.handleExpandChange(true, item)
      }
    }
    handleCancel()
  })

  React.useEffect(() => {
    isEdit && form.setFieldValue("name", item.name)
  }, [isEdit])

  //  系统添加的 表单
  const SystemForm = () => (
    <Form onFinish={onFinish} form={form}>
      <Form.Item rules={[{ required: true, message: "需要选择EBS数据" }]} name="next_ebs_id">
        <Select
          placeholder="请选择EBS结构"
          size="large"
          options={deletedDataList.map((item) => ({
            label: item.name,
            value: item.id,
          }))}></Select>
      </Form.Item>
      <Form.Item>
        <div className="flex justify-end gap-2.5">
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" className="bg-railway_blue" htmlType="submit">
            确定
          </Button>
        </div>
      </Form.Item>
    </Form>
  )

  const CustomForm = () => (
    <Form onFinish={onFinish} form={form}>
      <Form.Item rules={[{ required: true, message: "需要选择EBS数据" }]} name="name">
        <Input />
      </Form.Item>
      <Form.Item>
        <div className="flex justify-end gap-2.5">
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" className="bg-railway_blue" htmlType="submit">
            确定
          </Button>
        </div>
      </Form.Item>
    </Form>
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
      <Modal title={isEdit ? "修改" : "添加"} open={open} footer={null} onCancel={handleCancel}>
        {renderForm()}
      </Modal>
    </>
  )
}

export default DialogEBS
