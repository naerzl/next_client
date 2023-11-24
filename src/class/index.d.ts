export interface LrsOauth2Initiate {
  state: string
  redirect_url: string
}

export interface ReqFetch<T> {
  code: number
  msg: string
  data: T
}

export interface ReqOauth2InitiateResponse {
  location: string
}

export interface ReqOauth2GetTokenResponse {
  access_token: string
  token_type: string
  refresh_token: string
  expiry: string
}

export interface ReqOauth2GetTokenRequest {
  state: string
  code: string
}
