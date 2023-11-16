"use client"
import React from "react"
import { LayoutContext } from "@/components/LayoutContext"
import useSWRMutation from "swr/mutation"
import { reqGetCompletionArchiveObject } from "@/app/completion-management/api"
import DocViewer, { DocViewerRenderers } from "react-doc-viewer"

export default function Page() {
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getCompletionArchiveObjectApi } = useSWRMutation(
    "/completion-archive/object",
    reqGetCompletionArchiveObject,
  )

  const [arrayBuffer, setArrayBuffer] = React.useState<ArrayBuffer>()
  const [uri, setUri] = React.useState("")
  const getFile = async () => {
    const res = await getCompletionArchiveObjectApi({
      project_id: PROJECT_ID,
      path: "completion_archives/basic/2.单位工程文件/48.单位工程质量验收记录表/单位工程申请表.xlsx",
    })
    setUri(res.url)
    const f = await fetch(res.url, { headers: { Host: res.headers.Host } })
    const ab = await f.arrayBuffer()
    setArrayBuffer(ab)
    console.log()
  }

  React.useEffect(() => {
    getFile()
  }, [])
  return (
    <div>
      {arrayBuffer && (
        <DocViewer
          documents={[{ uri: uri, fileData: arrayBuffer, fileType: "xls" }]}
          pluginRenderers={DocViewerRenderers}
          style={{ height: 1000 }}
        />
      )}
    </div>
  )
}
