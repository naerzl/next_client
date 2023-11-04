"use client"
import React from "react"
import { Breadcrumbs, Button } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import useSWRMutation from "swr/mutation"
import { reqGetCompletionArchive } from "@/app/completion-management/api"
import { PROJECT_ID } from "@/libs/const"
import {
  CompletionArchiveList,
  CompletionArchiveListFiles,
} from "@/app/completion-management/types"

const PATH = "completion_archives/basic/"

export default function QueuePage() {
  const getTasks = () => {}

  return (
    <>
      <h3 className="font-bold text-[1.875rem]">导出任务</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            导出任务
          </Typography>
        </Breadcrumbs>
      </div>
      <header className="flex justify-between mb-4">
        <div className="flex"></div>
        <div></div>
      </header>
      <div className="bg-white border custom-scroll-bar shadow-sm min-h-[570px] flex gap-x-3"></div>
    </>
  )
}
