/**
 * Created by ChengZheLin on 2019/4/10.
 * Features: Weibo
 */
import md5 from 'md5'
import Requests from '../../_class/Requests'

interface AccountInterface {
  readonly a: string,
  readonly p: string
}

class Weibo extends Requests {
  constructor(account: string | [AccountInterface], password?: string) {
    super()

    // 配置基础数据
    this.url = 'https://appblog.sina.com.cn/api/passport/v3_1/login.php'
    this.account = account
    this.password = password || ''
  }

  async crack(): Promise<void> {
    let time = Math.floor(new Date().getTime() / 1000)
    let sign = time + '_' + md5(this.account + this.password + time)

    await this.rq({
      formData: {
        "cookie_format": "1",
        "sign": sign,
        "pin": "e3eb41c951f264a6daa16b6e4367e829",
        "appver": "5.3.2",
        "appkey": "2546563246",
        "phone": this.account,
        "entry": "app_blog",
        "pwd": this.password
      }
    })
  }
}

export default Weibo
