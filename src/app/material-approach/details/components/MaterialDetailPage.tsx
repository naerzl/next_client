"use client"
import React from "react"
import { Breadcrumbs } from "@mui/material"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"

export default function MaterialDetailPage() {
  return (
    <>
      <h3 className="font-bold text-[1.875rem]">物资进场</h3>
      <div className="mb-9 mt-7">
        <Breadcrumbs aria-label="breadcrumb" separator=">">
          <Link underline="hover" color="inherit" href="/dashboard">
            <i className="iconfont icon-homefill" style={{ fontSize: "14px" }}></i>
          </Link>
          <Link underline="hover" color="inherit" href="/material-approach">
            物资进场
          </Link>
          <Typography color="text.primary" sx={{ fontSize: "14px" }}>
            详情信息
          </Typography>
        </Breadcrumbs>
      </div>
      <div className="flex-1 bg-white p-10">
        <h3 className="text-2xl mb-6">物资进场详情信息</h3>
        <hr className="mb-2.5" />
        <div className="mb-2.5 text-[#6b7886]">
          <b>到货日期：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>物资名称：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>到货数量：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>合格证编号：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>生产厂商：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>委托单编号：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>处理结果：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>处理意见：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>储存场所：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>供货单位：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>备注：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>录入时间：</b>
          <span></span>
        </div>
        <div className="mb-2.5 text-[#6b7886]">
          <b>录入者：</b>
          <span></span>
        </div>
      </div>
    </>
  )
}
