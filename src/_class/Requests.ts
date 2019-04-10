/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: Sliding Verification Code
 */

import rq from 'request-promise-native'


interface AccountInterface {
  readonly a: string,
  readonly p: string
}

export default class Requests {
  url: string
  account: string | [AccountInterface]
  password: string = ''

  async rq (params: any) {
    return await rq({
      url: this.url,
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 5.1.1; nxt-al10 Build/LYZ28N) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/39.0.0.0 Mobile Safari/537.36 sinablog-android/5.3.2 (Android 5.1.1; zh_CN; huawei nxt-al10/nxt-al10)",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      ...params
    })
  }
}
