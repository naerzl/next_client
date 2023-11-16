"use client"
import React from "react"
import * as XLSX from "xlsx"
import useSWRMutation from "swr/mutation"
import { reqGetCompletionArchiveObject } from "@/app/completion-management/api"
import { LayoutContext } from "@/components/LayoutContext"

type Props = {
  fileUrl: string
}
export default function CustomXLSX(props: Props) {
  const { fileUrl } = props
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getCompletionArchiveObjectApi } = useSWRMutation(
    "/completion-archive/object",
    reqGetCompletionArchiveObject,
  )

  const [__html, setHTML] = React.useState("")

  const getFile = async () => {
    const res = await getCompletionArchiveObjectApi({
      project_id: PROJECT_ID,
      path: fileUrl,
    })

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

    fileUrl != "" && getFile()
  }, [fileUrl])

  return <div className="custom_XLSX" dangerouslySetInnerHTML={{ __html }} />
}
