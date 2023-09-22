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
export async function fetcher<T>(params: FetcherOptions<T>) {
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
    authCodeOfCookie = getCookie(OAUTH2_ACCESS_TOKEN as string)
    return fetch(`${url}`, {
      method: method || "get",
      body,
      headers: authCodeOfCookie
        ? {
            Authorization: `Bearer ${authCodeOfCookie}`,
          }
        : undefined,
    })
  }

  // 调用请求
  const fetch_res = await ufetch()

  try {
    // 如果HTTP状态码为401
    if (fetch_res.status == StatusCodes.UNAUTHORIZED) {
      isStatusOk = false
      // 刷新token
      const resRefresh = await lrsOAuth2Instance.lrsOAuth2rRefreshToken(
        getV1BaseURL("/refresh"),
        `Bearer ${authCodeOfCookie}`,
      )
      if (resRefresh.status == StatusCodes.UNAUTHORIZED) {
        throw new Error("401")
      }
      const result = await resRefresh.json()
      if (result.code == STATUS_SUCCESS) {
        // 设置新的cookie
        setCookie(OAUTH2_ACCESS_TOKEN, result.data.access_token)
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

  const res = await (isStatusOk ? fetch_res : ufetch())
  const r = await res!.json()
  if (r.code !== STATUS_SUCCESS) {
    message.error(r.msg)
    return Promise.reject(r.msg)
  }
  return r.data
}
