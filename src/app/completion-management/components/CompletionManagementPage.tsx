"use client"
import React from "react"
import { Breadcrumbs, Button } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import useSWRMutation from "swr/mutation"
import {
  reqGetCompletionArchive,
  reqGetCompletionArchiveObject,
} from "@/app/completion-management/api"
import { PROJECT_ID } from "@/libs/const"
import {
  CompletionArchiveList,
  CompletionArchiveListFiles,
} from "@/app/completion-management/types"

const PATH = "completion_archives/basic/"

export default function CompletionManagementPage() {
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
      setCompletionArchiveList(
        res.dir && res.files
          ? res
          : {
              dir: [],
              files: [],
            },
      )
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
  }

  const handleReview = async (item: CompletionArchiveListFiles) => {
    const res = await getCompletionArchiveObjectApi({ project_id: PROJECT_ID, path: item.key })
    console.log(res)
  }

  const handleGetFile = () => {}

  const renderPath = (path: string) => {
    const pathArr = path.split("/")

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

  const preViewPath =
    "https://zctc.obs.cn-north-9.myhuaweicloud.com:443/completion_archives/basic/2.%E5%8D%95%E4%BD%8D%E5%B7%A5%E7%A8%8B%E6%96%87%E4%BB%B6/48.%E5%8D%95%E4%BD%8D%E5%B7%A5%E7%A8%8B%E8%B4%A8%E9%87%8F%E9%AA%8C%E6%94%B6%E8%AE%B0%E5%BD%95%E8%A1%A8/%E5%8D%95%E4%BD%8D%E5%B7%A5%E7%A8%8B%E7%94%B3%E8%AF%B7%E8%A1%A8.xlsx?AWSAccessKeyId=6KXPFE0WUFEJGZPCSAAP&Expires=1699005776&Signature=IIL7BYnOG4dVsn22Cyk%2BBW5Nifg%3D"

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
        <div>
          <button>文件</button>
        </div>
      </header>
      <div className="bg-white border custom-scroll-bar shadow-sm flex-1 flex gap-x-3">
        <div className="flex-1">
          {dirLoading ? (
            <div className=" flex items-center justify-center w-full h-full">
              <div className="loader"></div>
            </div>
          ) : (
            <ul className="h-full">
              <li className="border-b h-9 flex items-center gap-x-2 pl-3">
                <i
                  className="iconfont icon-return text-xl cursor-pointer"
                  title="返回上一级"
                  onClick={() => {
                    handleReturn()
                  }}></i>
              </li>
              {completionArchiveList.dir.length > 0 ? (
                completionArchiveList.dir.map((item) => (
                  <li
                    key={item}
                    className="border-b h-9 flex items-center gap-x-2 pl-3 cursor-pointer "
                    onClick={() => {
                      setCurrentPath(item)
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
        <div className="flex-1 border-x">
          {dirLoading ? (
            <div className=" flex items-center justify-center w-full h-full">
              <div className="loader"></div>
            </div>
          ) : (
            <ul className="h-full">
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
        <div className="flex-[2]">
          {/*<iframe*/}
          {/*  // src="http://192.168.2.17:3002/"*/}
          {/*  src={preViewPath}*/}
          {/*  className="w-full h-full"*/}
          {/*  sandbox="allow-scripts allow-top-navigation allow-same-origin allow-popups"*/}
          {/*/>*/}

          <embed
            style={{
              width: "100%",
              height: "100%",
            }}
            type="application/pdf"
            src={
              "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf#toolbar=0&navpanes=0&scrollbar=0#pagemode=none"
            }
            // src={
            //   "https://api.idocv.com/view/url?url=http%3a%2f%2fapi.idocv.com%2fdata%2fdoc%2ftest.xlsx"
            // }
          />
        </div>
      </div>
    </>
  )
}
