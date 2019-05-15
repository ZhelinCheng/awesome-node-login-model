/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: Sliding Verification Code
 */

import rq from 'request-promise-native'
import Url from 'url'

interface StartInterface {
  account: string
  password: string
  cookies: string | any[]
}

export default abstract class Requests {
  url: string
  account: string
  password: string = ''
  cookies: string | any[]

  async rq(params: any) {
    return await rq({
      url: this.url,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; nxt-al10 Build/LYZ28N) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/39.0.0.0 Mobile Safari/537.36 sinablog-android/5.3.2 (Android 5.1.1; zh_CN; huawei nxt-al10/nxt-al10)',
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      ...params
    })
  }

  /**
   * 获取Cookie字符串
   * @param url 当前URL
   */
  getCookie(url?: string): string {
    let cookie: string = ''
    if (!this.cookies) {
      return cookie
    }

    let rqUrl: any = url ? Url.parse(url) : {}
    // const time = new Date().getTime()

    for (let item of this.cookies) {
      let t = item.domain.replace(/^\./, '')
      t = t.replace(/\./g, '\\.')
      let re = new RegExp(t)

      if (
        url
        && !re.test(rqUrl.host)
        && (item.path !== '/' && item.path !== rqUrl.path)
      ) {
        continue
      }

      cookie += `${item.name}=${item.value}; `
    }

    return cookie
  }

  abstract start(account: string, password: string): Promise<StartInterface>
}

