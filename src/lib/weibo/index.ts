/**
 * Created by ChengZheLin on 2019/4/10.
 * Features: Weibo
 */
import md5 from 'md5'
import Requests from '../../base/Requests'

export default class Weibo extends Requests {
  constructor() {
    super()

    // 配置基础数据
    this.url = 'https://appblog.sina.com.cn/api/passport/v3_1/login.php'
  }

  async start(account: string, password: string) {
    this.account = account
    this.password = password
    let cookies: string = ''

    if (!account || !password) {
      console.log('未指定账号密码')
      return {
        account,
        password,
        cookies
      }
    }

    const time = Math.floor(new Date().getTime() / 1000)
    const sign = time + '_' + md5(this.account + this.password + time)

    cookies = await this.rq({
      method: 'post',
      formData: {
        'cookie_format': '1',
        'sign': sign,
        'pin': 'e3eb41c951f264a6daa16b6e4367e829',
        'appver': '5.3.2',
        'appkey': '2546563246',
        'phone': this.account,
        'entry': 'app_blog',
        'pwd': this.password
      }
    })

    return {
      account,
      password,
      cookies
    }
  }
}
