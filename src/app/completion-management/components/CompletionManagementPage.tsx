"use client"
import React from "react"
import { Breadcrumbs } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import useSWRMutation from "swr/mutation"
import {
  reqGetCompletionArchive,
  reqGetCompletionArchiveObject,
} from "@/app/completion-management/api"
import {
  CompletionArchiveList,
  CompletionArchiveListFiles,
} from "@/app/completion-management/types"
import { LayoutContext } from "@/components/LayoutContext"
import CustomXLSX from "./CustomXLSX"
import CustomDocx from "./CustomDocx"
import CustomPDF from "./CustomPDF"

const PATH = "completion_archives/basic/"

export default function CompletionManagementPage() {
  const { projectId: PROJECT_ID } = React.useContext(LayoutContext)

  const { trigger: getCompletionArchiveApi } = useSWRMutation(
    "/completion-archive",
    reqGetCompletionArchive,
  )

  const { trigger: getCompletionArchiveObjectApi } = useSWRMutation(
    "/completion-archive/object",
    reqGetCompletionArchiveObject,
  )

  const [currentPath, setCurrentPath] = React.useState<string>(PATH)

  const [dirLoading, setDirLoading] = React.useState(false)

  const [completionArchiveList, setCompletionArchiveList] = React.useState<CompletionArchiveList>({
    dir: [],
    files: [],
  } as CompletionArchiveList)

  const getCompletionArchiveList = async (path: string) => {
    try {
      setDirLoading(true)
      const res = await getCompletionArchiveApi({ project_id: PROJECT_ID, path })
      setCompletionArchiveList({
        dir: res.dir ? res.dir : [],
        files: res.files ? res.files : [],
      })
    } finally {
      setTimeout(() => {
        setDirLoading(false)
      }, 800)
    }
  }

  React.useEffect(() => {
    getCompletionArchiveList(currentPath)
  }, [currentPath])

  const handleReturn = () => {
    const pathArr = currentPath.split("/")
    if (pathArr.length <= 3) return

    const path = pathArr.slice(0, pathArr.length - 2).join("/")
    setCurrentPath(path + "/")
    setFileUrl("")
  }

  const [fileUrl, setFileUrl] = React.useState("")

  const handleReview = async (item: CompletionArchiveListFiles) => {
    setFileUrl(item.key)
    if (fileUrl == item.key) {
      const res = await getCompletionArchiveObjectApi({ project_id: PROJECT_ID, path: item.key })
      const el = document.createElement("a")
      el.style.display = "none"
      el.setAttribute("target", "_blank")
      el.setAttribute("download", "文件")
      el.href = res.url
      document.body.appendChild(el)
      el.click()
      document.body.removeChild(el)
    }
  }

  const getCurrentDirName = () => {
    const currentPathArr = currentPath.split("/")
    if (currentPathArr.length > 3) {
      return currentPathArr[currentPathArr.length - 2]
    }
    return ""
  }

  const renderPath = (path: string) => {
    const newPath = path.replace(PATH, "")
    const pathArr = newPath.split("/")

    const handleClick = (index: number) => {
      console.log()
      const selectPath = pathArr.slice(0, index + 1).join("/")
      setCurrentPath(selectPath + "/")
    }

    return pathArr.map((str, index) => {
      let lastIndex = index == pathArr.length - 2
      return (
        <span
          key={index}
          style={{
            color: lastIndex ? "#303133" : "#ccc",
            cursor: lastIndex ? "initial" : "pointer",
          }}
          onClick={() => {
            handleClick(index)
          }}>
          {str}
          {index < pathArr.length - 1 && "/"}
        </span>
      )
    })
  }

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">竣工资料</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            竣工资料
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex">{renderPath(currentPath)}</div>
        <div></div>
      </header>
      <div className="bg-white border custom-scroll-bar shadow-sm flex-1 flex gap-x-3 overflow-y-auto h-[584px] ">
        <div className="flex-1 overflow-y-auto border-r">
          {dirLoading ? (
            <div className=" flex items-center justify-center w-full h-full">
              <div className="loader"></div>
            </div>
          ) : (
            <ul>
              <li className="border-b h-9 flex items-center gap-x-2 pl-3 sticky top-0 bg-white">
                <i
                  className="iconfont icon-return text-xl cursor-pointer"
                  title="返回上一级"
                  onClick={() => {
                    handleReturn()
                  }}></i>
                <span>文件夹名称</span>
              </li>
              {completionArchiveList.dir.length > 0 ? (
                completionArchiveList.dir.map((item) => (
                  <li
                    key={item}
                    className="border-b h-9 flex items-center gap-x-2 pl-3 cursor-pointer "
                    onClick={() => {
                      setCurrentPath(item)
                      setFileUrl("")
                    }}>
                    <i className="iconfont icon-wenjianjia text-[#ffca28] text-xl"></i>
                    <span
                      className="overflow-hidden text-ellipsis whitespace-nowrap w-[375px]"
                      title={item.replace(currentPath, "").replace("/", "")}>
                      {item.replace(currentPath, "").replace("/", "")}
                    </span>
                  </li>
                ))
              ) : (
                <li
                  style={{ height: "calc(100% - 2.25rem)" }}
                  className="flex justify-center items-center">
                  没有子文件夹~
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="flex-1 border-x overflow-y-auto">
          {dirLoading ? (
            <div className=" flex items-center justify-center w-full h-full">
              <div className="loader"></div>
            </div>
          ) : (
            <ul>
              <li className="border-b h-9 flex items-center gap-x-2 pl-3 sticky top-0 bg-white">
                文件名称
              </li>
              {completionArchiveList.files.length > 1 ? (
                completionArchiveList.files.slice(1).map((item, index) => (
                  <li
                    key={index}
                    className="border-b h-9 flex items-center gap-x-2 pl-3 cursor-pointer "
                    onClick={() => {
                      handleReview(item)
                    }}>
                    {item.key.endsWith("xlsx") && (
                      <i className="iconfont icon-format-xlsx text-[#039e55] text-xl"></i>
                    )}

                    {item.key.endsWith("pdf") && (
                      <i className="iconfont icon-format-pdf text-[#ef4a4a] text-xl"></i>
                    )}
                    {item.key.includes("doc") && (
                      <i className="iconfont icon-file-word text-[#0071ce] text-xl"></i>
                    )}
                    <span
                      className="overflow-hidden text-ellipsis whitespace-nowrap w-[375px]"
                      title={item.key.replace(currentPath, "").replace("/", "")}>
                      {item.key.replace(currentPath, "").replace("/", "")}
                    </span>
                  </li>
                ))
              ) : (
                <li
                  style={{ height: "calc(100% - 2.25rem)" }}
                  className="flex justify-center items-center">
                  没有文件~
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="flex-[2] overflow-y-auto">
          {fileUrl.includes(".docx") && <CustomDocx fileUrl={fileUrl} />}
          {fileUrl.includes(".xlsx") && <CustomXLSX fileUrl={fileUrl} />}
          {fileUrl.includes(".pdf") && <CustomPDF fileUrl={fileUrl} />}
        </div>
      </div>
    </>
  )
}
