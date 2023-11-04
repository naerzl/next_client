"use client"
import React from "react"
import * as XLSX from "xlsx"
import { CompletionArchiveListFiles } from "@/app/completion-management/types"
import { PROJECT_ID } from "@/libs/const"
import useSWRMutation from "swr/mutation"
import { reqGetCompletionArchiveObject } from "@/app/completion-management/api"

export default function Numbers2HTML() {
  const { trigger: getCompletionArchiveObjectApi } = useSWRMutation(
    "/completion-archive/object",
    reqGetCompletionArchiveObject,
  )

  const [__html, setHTML] = React.useState("")
  const handleReview = async (item: CompletionArchiveListFiles) => {
    const res = await getCompletionArchiveObjectApi({
      project_id: PROJECT_ID,
      path: "completion_archives/basic/2.单位工程文件/48.单位工程质量验收记录表/单位工程申请表.xlsx",
    })
    console.log(res)
  }

  const getFile = async () => {
    const res = await getCompletionArchiveObjectApi({
      project_id: PROJECT_ID,
      path: "completion_archives/basic/2.单位工程文件/48.单位工程质量验收记录表/单位工程申请表.xlsx",
    })

    console.log(res.headers.Host)

    const f = await fetch(res.url, { headers: { Host: res.headers.Host } })
    const ab = await f.arrayBuffer()

    /* Parse file */
    const wb = XLSX.read(ab)
    const ws = wb.Sheets[wb.SheetNames[0]]

    /* Generate HTML */
    setHTML(XLSX.utils.sheet_to_html(ws))
  }

  /* Fetch and update HTML */
  React.useEffect(() => {
    /* Fetch file */
    getFile()
  }, [])

  return <div dangerouslySetInnerHTML={{ __html }} />
}
