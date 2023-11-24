"use client"

import React from "react"
import * as docx from "docx-preview"
import { LayoutContext } from "@/components/LayoutContext"
import useSWRMutation from "swr/mutation"
import { reqGetCompletionArchiveObject } from "@/app/completion-management/api"

type Props = {
  fileUrl: string
}

export default function CustomDocx(props: Props) {
  const { fileUrl } = props
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getCompletionArchiveObjectApi } = useSWRMutation(
    "/completion-archive/object",
    reqGetCompletionArchiveObject,
  )

  const getFile = async () => {
    const res = await getCompletionArchiveObjectApi({
      project_id: PROJECT_ID,
      path: fileUrl,
    })

    const f = await fetch(res.url, { headers: { Host: res.headers.Host } })
    const ab = await f.arrayBuffer()
    docx
      .renderAsync(ab, document.getElementById("panel-section")!)
      .then((x) => console.log("docx: finished"))
  }

  React.useEffect(() => {
    fileUrl != "" && getFile()
  }, [fileUrl])
  return <div id="panel-section"></div>
}
