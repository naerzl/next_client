"use client"
import { lrsOAuth2Instance } from "@/libs/init_oauth"
import { useSearchParams, useRouter } from "next/navigation"
import React from "react"
import { getV1BaseURL } from "@/libs/fetch"
import { OAUTH2_ACCESS_TOKEN, OAUTH2_TOKEN_EXPIRY } from "@/libs/const"
import { reqGetCurrentProject } from "@/app/member-department/api"
import { message } from "antd"
import { reqGetPermission } from "@/app/api"
import { LayoutContext } from "@/components/LayoutContext"
import dayjs from "dayjs"
import { ReqGetProjectCurrentResponse } from "@/app/member-department/types"
import Nav from "@/components/Nav"

// 加点注释重新推

function Auth2() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const layoutCtx = React.useContext(LayoutContext)

  const navRef = React.useRef<any>(null)

  const [isExpired, setIsExpired] = React.useState(false)
  const [project, setProject] = React.useState<ReqGetProjectCurrentResponse>({
    project: {},
  } as ReqGetProjectCurrentResponse)

  const [waitWithProjectAndPermission, setWaitWithProjectAndPermission] = React.useState(true)

  const getProjectList = async () => {
    try {
      setWaitWithProjectAndPermission(true)
      const res = await reqGetCurrentProject("/project/current")
      // 当前项目数据为null 跳转
      if (!res) {
        message.error("您未在项目内，5秒内将为您跳转至官网！")
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(0)
          }, 5000)
        })

        router.push(process.env.NEXT_PUBLIC_WEB_PATH as string)
      }

      // 筛选出项目不为null的
      const newRes = res.filter((item) => item.project != null)
      layoutCtx.changeProjectList(newRes ?? [])
      const obj = newRes.find((item) => item.is_default == 1)

      const noNullItem = newRes.find((item) => item.project != null)
      // 如果所有的子项目为空
      if (!noNullItem) {
        message.error("您未在项目内，5秒内将为您跳转至官网！")
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(0)
          }, 5000)
        })

        router.push(process.env.NEXT_PUBLIC_WEB_PATH as string)
      }
      let _projectId = 1

      if (obj) {
        setProject(obj)
        _projectId = obj.project.id
      } else {
        if (noNullItem) {
          _projectId = noNullItem.project.id
        } else {
          message.error("您未在项目内，5秒内将为您跳转至官网！")
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(0)
            }, 5000)
          })

          router.push(process.env.NEXT_PUBLIC_WEB_PATH as string)
        }
      }

      if (obj && obj.project && dayjs(obj.project.expired_at).unix() < dayjs(Date.now()).unix()) {
        setProject(obj)
        return "expired"
      }

      layoutCtx.changeProject(_projectId)

      //  获取相关权限

      const resPermission = await reqGetPermission("/permission", {
        arg: { project_id: _projectId },
      })

      layoutCtx.changePermissionList(resPermission)
      layoutCtx.changePermissionTagList(
        resPermission.map((item) => {
          const tag = item.permission + "_" + item.action
          return tag.trim()
        }),
      )

      return ""
    } finally {
      setWaitWithProjectAndPermission(false)
    }
  }

  const handle = () => {
    if (searchParams.get("code")) {
      lrsOAuth2Instance
        .lrsOAuth2GetToken(getV1BaseURL("/oauth2"), {
          code: searchParams.get("code") as string,
          state: searchParams.get("state") as string,
        })
        .then(async (res) => {
          if (res.code !== 2000) return
          localStorage.setItem(OAUTH2_ACCESS_TOKEN, res.data.access_token)
          localStorage.setItem(OAUTH2_TOKEN_EXPIRY, res.data.expiry)
          const result = await getProjectList()

          if (result == "expired") {
            return setIsExpired(true)
          }
          if (searchParams.get("is_first_login") == "true") {
            router.push(
              `${process.env.NEXT_PUBLIC_AUTH_PATH}/firstchangepassword?t=${res.data.access_token}`,
            )
          } else {
            router.push("/dashboard/")
          }
        })
    } else {
      router.push("/")
    }
  }

  React.useEffect(() => {
    handle()
    // @ts-ignore
  }, [])

  if (isExpired) {
    return (
      <div className="flex flex-col w-full">
        <Nav ref={navRef} />
        {waitWithProjectAndPermission ? (
          <div className="container">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <div>
              <div className="text-center">
                {project.project.name}项目已过期，你可以进行以下操作
              </div>
              {layoutCtx.projectList.length > 1 ? (
                <div className="flex justify-center gap-x-5">
                  <a className="text-railway_blue" href={process.env.NEXT_PUBLIC_WEB_PATH}>
                    创建项目
                  </a>
                  <span>或</span>
                  <span className="text-railway_blue" onClick={() => {}}>
                    切换其他项目
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <a className="text-railway_blue" href={process.env.NEXT_PUBLIC_WEB_PATH}>
                    创建项目
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return <></>
}

export default Auth2
