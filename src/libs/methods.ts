import { OAUTH2_ACCESS_TOKEN } from "./const"
import { getCookie } from "./cookies"

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