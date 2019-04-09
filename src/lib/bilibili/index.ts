/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: index
 */

import path from 'path'
import puppeteer from 'puppeteer'
import looksSame from 'looks-same'
import SlidingVerificationCode from '../../_class/SlidingVerificationCode'
import * as utils from '../../utils/index'

interface AccountInterface {
  a: string,
  p: string
}

class Bilibili extends SlidingVerificationCode {
  browser: any
  page: any
  url: string
  // 公差
  tolerance: number = 60
  // 账号密码
  account: string | [AccountInterface]
  password: string = ''

  /**
   * 初始化
   * @param account {string|Array}
   * @param password {string}
   */
  constructor(account: string | [AccountInterface], password?: string) {
    super()

    // 配置基础数据
    this.url = 'https://passport.bilibili.com/login'
    this.account = account
    this.password = password || ''
  }

  /**
   * 创建浏览器
   */
  async createBrowser(): Promise<void> {
    // 配置浏览器选项
    const options = {
      headless: process.env.NODE_ENV !== 'development',
      defaultViewport: {
        width: 1300,
        height: 640
      }
    }

    this.browser = await puppeteer.launch(options)
    const page = await this.browser.newPage()
    await page.goto(this.url)
    await page.screenshot({path: 'example.png'})
    this.page = page
  }

  /**
   * 登录 - 输入账号密码
   */
  async login(): Promise<void> {
    // 输入账号
    await utils.timeout(1)
    await this.page.type('#login-username', this.account, {delay: 100})
    // 输入密码
    await utils.timeout(1)
    await this.page.type('#login-passwd', this.password, {delay: 100})
  }

  /**
   * 获取验证码图片的位置
   * @returns {Array} 验证码位置
   */
  async getPosition(button: any): Promise<number[]> {
    // 将鼠标移动至滑块
    await button.hover()
    // 获取验证码图片位置
    await utils.timeout(0.5)
    const img =  await this.page.$('.gt_box')
    // 获取验证码图片左顶点xy坐标
    let {x, y} = await img.boundingBox()
    // 获取验证码图片宽高
    let {width, height} = await img.boxModel()

    x += this.tolerance
    width -= this.tolerance
    height -= 20
    return [x, y, width, height]
  }

  /**
   * 获取两次验证码截图
   * @param button 滑块
   * @param actual {string} 原始验证码图片
   * @param expected {string} 缺口验证码图片
   */
  async getGeetestImage(button: any, actual: string = 'actual.png', expected: string = 'expected.png'): Promise<string[]> {
    let [x, y, width, height] = await this.getPosition(button)

    console.log(x, y, width, height)

    actual = path.resolve(__dirname, `./images/${actual}`)
    expected = path.resolve(__dirname, `./images/${expected}`)

    // 裁剪原始验证码图片
    await this.page.screenshot({
      path: actual,
      clip: {x, y, width, height}
    })

    // 点击滑块
    await button.click({
      button: 'middle',
      delay: 0
    })

    // 裁剪缺口验证码图片
    await utils.timeout(2)
    await this.page.screenshot({
      path: expected,
      clip: {x, y, width, height}
    })

    return [actual, expected]
  }

  getGap (captcha: string[]): Promise<number | null> {
    return new Promise((resolve, reject) => {
      let [img1, img2] = captcha
      console.log(img1, img2)
      looksSame(img1, img2, {
        tolerance: 4.5
      }, (err: any, data: any) => {
        if (err) reject(err)
        console.log(data)
        if (data) {
          resolve(data.diffBounds.left)
        } else {
          resolve(null)
        }
      })
    })
  }

  /**
   * 启动
   */
  async crack(): Promise<void> {
    await this.createBrowser()
    // await this.login()
    const button = await this.page.$('.gt_slider_knob.gt_show')
    const captcha = await this.getGeetestImage(button)
    // const captcha = ['./images/actual.png', './images/expected.png']

    let left: any = await this.getGap(captcha)
    console.log(left)

    let {x, y} = await button.boundingBox()

    console.log(x, y)
    left += x + this.tolerance
    left += 10



    await this.page.mouse.move(x + 15, y + 15);
    await this.page.mouse.down()
    await this.page.mouse.move(30, y + 15, { steps: 50 })
    await this.page.mouse.move(left - 30, y + 12, { steps: 40 })
    await this.page.mouse.up()
    console.log(left)
  }
}

export default Bilibili
