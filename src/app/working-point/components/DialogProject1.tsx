import React from "react"
import { Button, Cascader, Form, Input, Modal, Select } from "antd"
import useDebounce from "@/hooks/useDebounce"
import WorkingPointContext from "@/app/working-point/context/workingPointContext"
import useSWRMutation from "swr/mutation"
import { reqGetProjectSubSection, reqPostProjectSubSection } from "@/app/working-point/api"
import { TypePostProjectSubSectionParams } from "@/app/working-point/types"
import { reqGetEBS } from "@/app/ebs-data/api"
import { PROJECT_ID } from "@/libs/const"

interface Props {
  open: boolean
  // eslint-disable-next-line no-unused-vars
  changeDialogOpen: (open: boolean) => void
}

interface Option {
  value: number
  label: string
  code: string
}

interface UnitOptions {
  value: number
  label: string
  code: string
  subpart_name: string
  subpart_id: string
}

export default function DialogProject(props: Props) {
  const ctx = React.useContext(WorkingPointContext)
  const { open, changeDialogOpen } = props

  const { trigger: getEBSApi } = useSWRMutation("/ebs", reqGetEBS)

  // 获取表格数据SWR请求
  const { trigger: getProjectSubSectionApi } = useSWRMutation(
    "/project-subsection",
    reqGetProjectSubSection,
  )

  const [form] = Form.useForm()
  const handleCancel = () => {
    form.resetFields()
    changeDialogOpen(false)
  }

  const [unitOptions, setUnitOptions] = React.useState<UnitOptions[]>([])

  const [ebsOptions, setEBSOption] = React.useState<UnitOptions[]>([])

  React.useEffect(() => {
    getProjectSubSectionApi({ is_subset: 0, project_id: PROJECT_ID }).then((res) => {
      if (res && res.length > 0) {
        setUnitOptions(
          res.map(
            (item) => ({ ...item, label: item.name, value: item.id, code: item.code }) as any,
          ),
        )
      }
    })

    getEBSApi({ project_id: PROJECT_ID, is_hidde: 0 }).then((res) => {
      if (res && res.length > 0) {
        setEBSOption(
          res.map(
            (item) => ({ ...item, label: item.name, value: item.id, code: item.code }) as any,
          ),
        )
      }
    })
  }, [])

  const [formData, setFormData] = React.useState<TypePostProjectSubSectionParams>(
    {} as TypePostProjectSubSectionParams,
  )

  const { trigger: postProjectSubSection } = useSWRMutation(
    "/project-subsection/sub",
    reqPostProjectSubSection,
  )

  // 提交表单事件（防抖）
  const { run: onFinish } = useDebounce(async (value: any) => {
    // 深拷贝表单的对象 避免影响到表单展示
    const valueCopy = structuredClone(value)
    // 删除不需要的对象
    delete valueCopy.subpart
    delete valueCopy.unit
    // 调用添加接口
    await postProjectSubSection(Object.assign({ project_id: PROJECT_ID }, valueCopy, formData))
    // 重新获取列表
    ctx.getProjectSubSection()
    handleCancel()
  })

  // 渲染EBS专业
  const handleSelect = (value: string | number, selectedOptions: Option) => {
    if (value) {
      setFormData(
        Object.assign({}, formData, {
          ebs_id: value,
          ebs_name: selectedOptions.label,
          ebs_code: selectedOptions.code,
        }),
      )
    }
  }

  // 选择单位工程专业
  const handleUnitSelect = (value: string | number, selectedOptions: UnitOptions) => {
    console.log(selectedOptions)
    if (value) {
      setFormData(
        Object.assign({}, formData, {
          parent_id: value,
          subpart_name: selectedOptions.subpart_name,
          subpart_id: selectedOptions.subpart_id,
        }),
      )
    }
  }

  return (
    <>
      <Modal title="添加" open={open} footer={null} onCancel={handleCancel}>
        <Form onFinish={onFinish} form={form}>
          <Form.Item name="name" rules={[{ required: true, message: "请输入工点名称" }]}>
            <Input placeholder="请输入工点名称" />
          </Form.Item>
          <Form.Item name="unit" rules={[{ required: true, message: "请输入单位工程名称" }]}>
            <Select
              placeholder="请选择一个单位工程"
              options={unitOptions}
              onSelect={handleUnitSelect}
            />
          </Form.Item>
          <Form.Item name="subpart" rules={[{ required: true, message: "请选择一个专业" }]}>
            <Select placeholder="请选择一个专业" options={ebsOptions} onSelect={handleSelect} />
          </Form.Item>

          <Form.Item name="start_tally" rules={[{ required: true, message: "请输入开始" }]}>
            <Input placeholder="请输入开始" />
          </Form.Item>

          <Form.Item name="end_tally" rules={[{ required: true, message: "请输入结束" }]}>
            <Input placeholder="请输入结束" />
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