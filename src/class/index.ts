import {
  LrsOauth2Initiate,
  ReqFetch,
  ReqOauth2GetTokenRequest,
  ReqOauth2GetTokenResponse,
  ReqOauth2InitiateResponse,
} from "./index.d"

export class LrsOauth2 {
  // OAuth2 初始化
  lrsOAuth2Initiate(
    url: string,
    body: LrsOauth2Initiate,
  ): Promise<ReqFetch<ReqOauth2InitiateResponse>> {
    return fetch(
      // @ts-ignore
      `${url}?${new URLSearchParams(body).toString()}`,
    ).then((res) => res.json())
  }
  //   OAuth2 获取token
  lrsOAuth2GetToken(
    url: string,
    body: ReqOauth2GetTokenRequest,
  ): Promise<ReqFetch<ReqOauth2GetTokenResponse>> {
    return fetch(
      // @ts-ignore
      `${url}?${new URLSearchParams(body).toString()}`,
    ).then((res) => res.json())
  }

  // 刷新token
  lrsOAuth2rRefreshToken(url: string, Authorization: string) {
    return fetch(url, {
      headers: {
        Authorization,
      },
    })
  }
}
