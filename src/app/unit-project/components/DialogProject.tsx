"use client"
import React from "react"
import { Button, Cascader, Form, Input, Modal } from "antd"
import useDebounce from "@/hooks/useDebounce"
import UnitProjectContext from "@/app/unit-project/context/unitProjectContext"
import useSWRMutation from "swr/mutation"
import { reqGetSubSection, reqPostProjectSubSection } from "@/app/unit-project/api"
import { TypePostProjectSubSectionParams } from "@/app/unit-project/types"

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  changeDialogOpen: (open: boolean) => void
}

interface Option {
  value?: string | number | null
  label: React.ReactNode
  children?: Option[]
  isLeaf?: boolean
  code?: string
}

export default function DialogProject(props: Props) {
  const ctx = React.useContext(UnitProjectContext)
  const { open, changeDialogOpen } = props

  const [form] = Form.useForm()
  const handleCancel = () => {
    form.resetFields()
    changeDialogOpen(false)
  }

  const [options, setOptions] = React.useState<Option[]>([])

  React.useEffect(() => {
    setOptions(
      ctx.professionList.map((item) => ({ isLeaf: false, value: item.id, label: item.name })),
    )
  }, [ctx.professionList.length])

  const { trigger: getSubSectionApi } = useSWRMutation("/subsection", reqGetSubSection)

  const loadSelectData = async (selectedOptions: Option[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1]

    const res = await getSubSectionApi({ parent_id: JSON.stringify([targetOption.value]) })

    setTimeout(() => {
      if (res.length > 0) {
        targetOption.children = res.map((item) => ({
          label: item.name,
          value: item.id,
          code: item.code,
        }))
      } else {
        delete targetOption.children
        delete targetOption.isLeaf
      }
      setOptions([...options])
    }, 1000)
  }

  const [formData, setFormData] = React.useState<TypePostProjectSubSectionParams>(
    {} as TypePostProjectSubSectionParams,
  )

  const { trigger: postProjectSubSection } = useSWRMutation(
    "/project-subsection",
    reqPostProjectSubSection,
  )

  // 提交表单事件（防抖）
  const { run: onFinish } = useDebounce(async (value: any) => {
    // 深拷贝表单的对象 避免影响到表单展示
    const valueCopy = structuredClone(value)
    // 删除不需要的对象
    delete valueCopy.subpart
    // 调用添加接口
    await postProjectSubSection(Object.assign({}, valueCopy, formData))
    // 重新获取列表
    ctx.getProjectSubSection()
    handleCancel()
  })

  const handleCascaderChange = (value: (string | number)[], selectedOptions: Option[]) => {
    console.log(selectedOptions)
    if (value) {
      setFormData(
        Object.assign({}, formData, {
          subpart_id: value[value.length - 1],
          subpart_name: selectedOptions.map((item) => item.label).join("-"),
          code: selectedOptions[selectedOptions.length - 1].code,
        }),
      )
    }
  }

  return (
    <>
      <Modal title="添加" open={open} footer={null} onCancel={handleCancel}>
        <Form onFinish={onFinish} form={form}>
          <Form.Item name="name" rules={[{ required: true, message: "请输入单位工程名称" }]}>
            <Input placeholder="请输入单位工程名称" />
          </Form.Item>
          <Form.Item name="subpart" rules={[{ required: true, message: "请选择一个专业" }]}>
            <Cascader
              placeholder="请选择一个专业"
              options={options}
              loadData={loadSelectData}
              onChange={handleCascaderChange}
            />
          </Form.Item>
          <Form.Item name="start_mileage">
            <Input placeholder="请输入开始里程" />
          </Form.Item>
          <Form.Item name="start_tally" rules={[{ required: true, message: "请输入开始" }]}>
            <Input placeholder="请输入开始" />
          </Form.Item>
          <Form.Item name="end_mileage">
            <Input placeholder="请输入结束里程" />
          </Form.Item>
          <Form.Item name="end_tally" rules={[{ required: true, message: "请输入结束" }]}>
            <Input placeholder="请输入结束" />
          </Form.Item>
          <Form.Item name="calculate_value">
            <Input placeholder="请输入长度m" />
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
      </Modal>
    </>
  )
}
