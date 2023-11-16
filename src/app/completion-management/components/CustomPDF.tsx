"use client"
import React from "react"
import { LayoutContext } from "@/components/LayoutContext"
import useSWRMutation from "swr/mutation"
import { reqGetCompletionArchiveObject } from "@/app/completion-management/api"
import DocViewer, { PDFRenderer } from "react-doc-viewer"

type Props = {
  fileUrl: string
}
export default function Page(props: Props) {
  const { fileUrl } = props
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getCompletionArchiveObjectApi } = useSWRMutation(
    "/completion-archive/object",
    reqGetCompletionArchiveObject,
  )

  const [uri, setUri] = React.useState("")
  const [arrayBuffer, setArrayBuffer] = React.useState<ArrayBuffer>()
  const getFile = async () => {
    const res = await getCompletionArchiveObjectApi({
      project_id: PROJECT_ID,
      path: fileUrl,
    })
    setUri(res.url)
    const f = await fetch(res.url, { headers: { Host: res.headers.Host } })
    const ab = await f.arrayBuffer()
    setArrayBuffer(ab)
  }

  React.useEffect(() => {
    fileUrl != "" && getFile()
  }, [fileUrl])
  return (
    <div>
      {arrayBuffer && (
        <DocViewer
          documents={[{ uri: uri, fileData: arrayBuffer, fileType: "pdf" }]}
          pluginRenderers={[PDFRenderer]}
        />
      )}
    </div>
  )
}
