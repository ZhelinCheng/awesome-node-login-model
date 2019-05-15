import Requests from "../../base/Requests"
import {Hmac, createHmac} from "crypto"

export default class ZhiHu extends Requests {

  loginData: any

  constructor(account: string, password: string) {
    super()
    // login api
    this.url = 'https://www.zhihu.com/api/v3/oauth/sign_in'
    this.account = account
    this.password = password

    this.loginData = {
      'client_id': 'c3cef7c66a1843f8b3a9e6a1e3160e20',
      'grant_type': 'password',
      'source': 'com.zhihu.web',
      'username': this.account,
      'password': this.password,
      'lang': 'en',
      'ref_source': 'homepage',
      'utm_source': ''
    }

  }

  /**
   *  模拟登录知乎
   :param captcha_lang: 验证码类型 'en' or 'cn'
   :param load_cookies: 是否读取上次保存的 Cookies
   :return: bool
   * 1. check cookies
   2.
   */
  async signIn(captchaLang = 'en', loadCookies = true): Promise<void> {

    // check user

    // load cookie

    // post

    let timestramp = new Date().getTime()
    this.loginData.lang = captchaLang
    this.loginData.timestramp = timestramp
    this.loginData.signature = this.getSignature(timestramp)
    this.loginData.captcha = await this.getCaptcha(captchaLang)

    let fromData = this.encrypt(this.loginData)

    let headers = {
      'accept-encoding': 'gzip, deflate, br',
      'Host': 'www.zhihu.com',
      'Referer': 'https://www.zhihu.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'content-type': 'application/x-www-form-urlencoded',
      'x-zse-83': '3_1.1',
      'x-xsrftoken': this.getXsrf()
    }


    return await this.rq({
      method: 'POST',
      headers: headers,
      fromData: fromData,
    })
  }

  /**
   *
   从登录页面获取 xsrf
   return: str
   */
  getXsrf() {

  }

  /**
   * 参数加密
   */
  encrypt(loginData: any): string {
    return 'ff'
  }

  /**
   *  通过 Hmac 算法计算返回签名
   实际是几个固定字符串加时间戳
   :param timestamp: 时间戳
   :return: 签名
   */
  getSignature(timestamp: number | string) {
    /**
     hmac 用法
     crypto.createHmac(‘sha1’, app_secret).update(args).digest().toString(‘base64’);
     // tslint:disable-next-line: jsdoc-format
     这样的加密就是hmac-sha1的。之前是因为要加密的参数忘记排序的了。
     */
    let key = 'd1b964811afb40118a12068ff74a12f4'
    let hc = createHmac('sha1', key)
    // 转bytes 可能有问题
    let arg = toUTF8Array(this.loginData.grant_type
      + this.loginData.client_id
      + this.loginData.source
      + timestamp.toString())
    return hc.update(arg.toString(), 'utf8').digest('hex')
  }

  /**
   * 请求验证码的 API 接口，无论是否需要验证码都需要请求一次
   如果需要验证码会返回图片的 base64 编码
   根据 lang 参数匹配验证码，需要人工输入
   :param lang: 返回验证码的语言(en/cn)
   :return: 验证码的 POST 参数
   */
  async getCaptcha(lang = 'en') {

    let api = `https://www.zhihu.com/api/v3/oauth/captcha?lang=${lang}`
    let resp = await fetch(api)
    let data = await resp.json()
    let showCaptcha = data.show_captcha
    if (showCaptcha) {

    }
  }

  // TODO 该方法必须实现
  start(account: string, password: string): Promise<any> {
    return undefined
  }

  CheckUserPass(): boolean {
    return false
  }
}
