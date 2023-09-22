import Cookies from "js-cookie"

export function getCookie(key: string) {
  return Cookies.get(key)
}

export function setCookie(key: string, value: string) {
  return Cookies.set(key, value, {
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  })
}

export function removeCookie(key: string) {
  return Cookies.remove(key)
}
