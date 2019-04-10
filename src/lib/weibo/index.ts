/**
 * Created by ChengZheLin on 2019/4/10.
 * Features: Weibo
 */
import md5 from 'md5'
import Requests from '../../base/Requests'

interface AccountInterface {
  readonly a: string,
  readonly p: string
}

export default class Weibo extends Requests {
  constructor() {
    super()

    // 配置基础数据
    this.url = 'https://appblog.sina.com.cn/api/passport/v3_1/login.php'
  }

  async start(account: string | [AccountInterface], password?: string): Promise<void> {
    this.account = account
    this.password = password || ''

    if (!this.account || !this.password) {
      return console.log('未指定账号密码')
    }

    const time = Math.floor(new Date().getTime() / 1000)
    const sign = time + '_' + md5(this.account + this.password + time)

    return await this.rq({
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
  }
}
