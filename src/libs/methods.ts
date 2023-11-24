import { OAUTH2_ACCESS_TOKEN } from "./const"
import { getCookie } from "./cookies"
import dayjs from "dayjs"
import tz from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

// oauth1.0发送statement

export const dynamicsSetRemByMobile = () => {
  let remRatio = 16 / 1920
  window.onresize = () => {
    document.documentElement.style.fontSize = `${remRatio * window.innerWidth}px`
  }
}

// 生成随机五个字符串
export function generateRandomString() {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < 5; i++) {
    let randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}

// 从cookie里面获取access_token
export function getCookieAccessToken() {
  const authCodeOfCookie =
    getCookie(OAUTH2_ACCESS_TOKEN as string) &&
    JSON.parse(getCookie(OAUTH2_ACCESS_TOKEN as string) as string)
  return authCodeOfCookie.access_token
}

export function checkObjectEquality(obj1: any, obj2: any) {
  //指向同一内存
  if (obj1 === obj2) return true
  let bankInfo = Object.getOwnPropertyNames(obj1),
    oldBankInfo = Object.getOwnPropertyNames(obj2)
  //判断属性值是否相等
  if (bankInfo.length !== oldBankInfo.length) return false

  for (let i = 0, max = bankInfo.length; i < max; i++) {
    let prop_name = bankInfo[i]
    if (obj1[prop_name] !== obj2[prop_name]) {
      return false
    }
  }
  return true
}

export function convertModelToFormData(model: any, form?: FormData, namespace = ""): FormData {
  let formData = form || new FormData()
  for (let propertyName in model) {
    if (!model.hasOwnProperty(propertyName) || model[propertyName] == undefined) continue
    let formKey = namespace ? `${namespace}${propertyName}` : propertyName
    if (model[propertyName] instanceof Array) {
      if (model[propertyName].length > 0) {
        model[propertyName].forEach((element: any, index: number) => {
          if (typeof element != "object") formData.append(`${formKey}`, `[${element}]`)
          else {
            const tempFormKey = `${formKey}[${index}]`
            convertModelToFormData(element, formData, tempFormKey)
          }
        })
      } else {
        formData.append(formKey, "[]")
      }
    } else if (typeof model[propertyName] === "object" && !(model[propertyName] instanceof File)) {
      convertModelToFormData(model[propertyName], formData, formKey)
    } else {
      formData.append(formKey, model[propertyName].toString())
    }
  }
  return formData
}

export const parseQueryString = (str: string) => {
  const search = new URLSearchParams(str)
  let obj: { [k: string]: any } = {}
  // @ts-ignore
  for (const key of search.entries()) {
    obj[key[0]] = key[1]
  }
  return obj
}

export function getHexColor(color: string) {
  let values = color
    .replace(/rgba?\(/, "")
    .replace(/\)/, "")
    .replace(/[\s+]/g, "")
    .split(",")
  let a = parseFloat(values[3] || "1"),
    r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
    g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
    b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255)
  return (
    "#" +
    ("0" + r.toString(16)).slice(-2) +
    ("0" + g.toString(16)).slice(-2) +
    ("0" + b.toString(16)).slice(-2)
  )
}

// 过滤字符串左右两边指定字符
export function trim(str: string, ch: string) {
  let start = 0,
    end = str.length

  while (start < end && str[start] === ch) ++start

  while (end > start && str[end - 1] === ch) --end

  return start > 0 || end < str.length ? str.substring(start, end) : str
}

export function dateToYYYYMM(date: string | Date) {
  dayjs.extend(tz)
  dayjs.extend(utc)
  return dayjs(date).tz("UTC").format("YYYY-MM-DD HH:mm:ss")
}

export function dateToUTCCustom(date: string | Date, type: string) {
  dayjs.extend(tz)
  dayjs.extend(utc)
  return dayjs(date).tz("UTC").format(type)
}

export function displayWithPermission(arr: string[], tag: string) {
  return arr.includes(tag) ? {} : { display: "none" }
}
