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
          resolve(data.diffBounds.left + this.tolerance + 10)
        } else {
          resolve(null)
        }
      })
    })
  }

  async moveButton (button: any, track: number[], left: number): Promise<void> {
    let {x, y} = await button.boundingBox()
    await this.page.mouse.move(x + 15, y + 15);
    await this.page.mouse.down()
    await utils.timeout(0.6)
    await this.page.mouse.move(x + left, 0, {steps: 60})
    for (let i in track) {
      await this.page.mouse.move(x + left + track[i], 0)
      await utils.timeout(0.0005)
    }

    await utils.timeout(0.6)
    await this.page.mouse.up()
  }

  /**
   * 获取滑动轨迹列表
   * @param distance {number} 缺块的x坐标
   * @returns {Array}
   */
  getTrack (distance: number): number[] {
    let track: number[] = []
    let current = 0
    let mid = distance * 2 / 3
    let t = 0.2
    let v = 0

    distance += 10

    while (current < distance) {
      let a: number = 0
      if (current < mid) {
        a = utils.random(1, 3)
      } else {
        a = utils.random(3, 5)
      }

      let v0 = v
      v = v0 + a * t

      let move = v0 * t + 0.5 * a * t * t
      current += move
      track.push(move)
      for (let i = 0; i < 2; i++) {
        track.push(-utils.random(2, 3))
      }

      for (let i = 0; i < 2; i++) {
        track.push(-utils.random(1, 4))
      }
    }

    return track
  }

  /**
   * 刷新验证码
   */
  async refreshCode (button: any): Promise<void> {
    //gt_refresh_button

    await button.hover()
    let refresh: any = await this.page.$('.gt_refresh_button')
    await utils.timeout(0.5)
    return await refresh.click()
  }

  /**
   * 启动
   */
  async crack(): Promise<void> {
    await this.createBrowser()
    await this.login()
    const button = await this.page.$('.gt_slider_knob.gt_show')
    let maxCount = 0

    while (maxCount < 3) {
      const captcha = await this.getGeetestImage(button)

      let left: any = await this.getGap(captcha)
      let track: number[] = this.getTrack(left)

      let info = await this.page.$('.gt_info_text')
      let pass = ''

      await this.moveButton(button, track, left)
      await utils.timeout(3)
      pass = await info.$eval('.gt_info_type', (node: any) => node.innerText)
      maxCount++
      if (pass.indexOf('失败') >= 0) {
        console.log(`验证失败，3s后重新验证...`)
        await utils.timeout(2)
        await this.refreshCode(button)
      } else {
        console.log(`验证成功，准备获取Cookie...`)
        maxCount = 3
      }
    }

    // todo 此处还有错误

    console.log(`程序许执行结束`)
    await this.browser.close()
    // await this.moveButton(button, track, left)
  }
}

export default Bilibili
