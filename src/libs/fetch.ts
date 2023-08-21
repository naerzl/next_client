import { getCookie, setCookie } from "./cookies"
import { formDataInstance, lrsOAuth2Instance } from "./init_oauth"
import { OAUTH2_ACCESS_TOKEN, OAUTH2_PATH_FROM, STATUS_SUCCESS } from "./const"
import { StatusCodes } from "http-status-codes"
import { generateRandomString } from "./methods"
import { message } from "antd"

// 拼接接口地址
export const getV1BaseURL = (url: string): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL + url
}

type MethodsType = "get" | "post" | "put" | "delete" | "patch"

interface FetcherOptions<T> {
  url: string
  method?: MethodsType
  arg?: T
  isJSON?: boolean
}

const handleGetUrl = (url: string) => {
  const flag = url.includes("?")
  return flag ? url.split("?")[0] : url
}
//
export function fetcher<T>(params: FetcherOptions<T>) {
  let { url, arg, method, isJSON } = params
  if (!method || method == "get") {
    url = handleGetUrl(url)
  }
  // 拿到传进来的路由拼接完整的api地址
  url = getV1BaseURL(url)
  let body: any = null
  switch (method) {
    case "post":
    case "put":
      body = isJSON ? JSON.stringify(arg) : formDataInstance.convertModelToFormData(arg)
      break
    case "delete":
      url += "/" + (arg as any).id
      body = isJSON ? JSON.stringify(arg) : formDataInstance.convertModelToFormData(arg)
      break
    default:
      const str = new URLSearchParams(arg as any).toString()
      str.length > 0 && (url += "?" + str)
  }

  // 判断请求状态码是否是成功的状态
  let isStatusOk = true
  let authCodeOfCookie: any = null

  // 闭包一个请求
  const ufetch = () => {
    // 从cookie里面获取oauth2的token
    authCodeOfCookie =
      getCookie(OAUTH2_ACCESS_TOKEN as string) &&
      JSON.parse(getCookie(OAUTH2_ACCESS_TOKEN as string) as string)
    return fetch(`${url}`, {
      method: method || "get",
      body,
      headers: authCodeOfCookie
        ? {
            Authorization: `Bearer ${authCodeOfCookie.access_token}`,
          }
        : undefined,
    })
  }

  // 调用请求
  const result = ufetch().then(async (res) => {
    // 判断请求http状态码是否为401
    try {
      if (res.status == StatusCodes.UNAUTHORIZED) {
        isStatusOk = false
        const res = await lrsOAuth2Instance.lrsOAuth2rRefreshToken(
          getV1BaseURL("/refresh"),
          `Bearer ${authCodeOfCookie.access_token}`,
        )
        if (res.status == StatusCodes.UNAUTHORIZED) {
          throw new Error("401")
        }
        const result = await res.json()
        if (result.code == STATUS_SUCCESS) {
          // 设置新的cookie
          setCookie(OAUTH2_ACCESS_TOKEN, JSON.stringify(result.data))
        } else {
          throw new Error("500")
        }
      }
    } catch (error) {
      const state = generateRandomString()
      // 补货到抛出的错误 重新初始化token 重新登录
      const res = await lrsOAuth2Instance.lrsOAuth2Initiate(getV1BaseURL("/initiate"), {
        state,
        redirect_url: location.origin + "/auth2",
      })
      if (res.code === STATUS_SUCCESS) {
        // 存储当前的url地址
        setCookie(OAUTH2_PATH_FROM as string, location.href)
        // 跳转到登录页面的地址
        location.href = res.data.location
      }
    }
    // 当通用请求fetcher http状态码不为401直接返回结果
    return res
  })

  return (isStatusOk ? result : ufetch())
    .then((res) => res.json())
    .then((res) => {
      if (res.code !== STATUS_SUCCESS) {
        message.error(res.msg)
        return Promise.reject(res.msg)
      }
      return res.data
    })
}
