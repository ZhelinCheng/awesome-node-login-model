/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: Bilibili
 */

import path from 'path'
import fs from 'fs'
import puppeteer from 'puppeteer'
import looksSame from 'looks-same'
import Requests from '../../base/Requests'
import * as utils from '../../utils/index'


const imagePath = path.resolve(__dirname, `./images`)


interface AccountInterface {
  readonly a: string,
  readonly p: string
}

export default class Bilibili extends Requests {
  browser: any
  page: any
  // 公差
  tolerance: number = 70

  /**
   * 初始化
   */
  constructor() {
    super()

    // 配置基础数据
    this.url = 'https://passport.bilibili.com/login'

    // 创建图片目录
    !fs.existsSync(imagePath) && fs.mkdirSync(imagePath)
  }

  /**
   * 创建浏览器
   */
  async createBrowser(): Promise<void> {
    // 配置浏览器选项
    const options = {
      headless: process.env.NODE_ENV === 'production',
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
    const img = await this.page.$('.gt_box')
    // 获取验证码图片左顶点xy坐标
    const {x, y} = await img.boundingBox()
    // 获取验证码图片宽高
    const {width, height} = await img.boxModel()

    return [
      x + this.tolerance,
      y,
      width - this.tolerance,
      height - 20
    ]
  }

  /**
   * 获取两次验证码截图
   * @param button 滑块
   * @param actual {string} 原始验证码图片
   * @param expected {string} 缺口验证码图片
   */
  async getGeetestImage(button: any, actual: string = 'actual.png', expected: string = 'expected.png'): Promise<string[]> {
    const [x, y, width, height] = await this.getPosition(button)

    console.log(x, y, width, height)

    actual = path.join(imagePath, `./${actual}`)
    expected = path.join(imagePath, `./${expected}`)

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
    await utils.timeout(3)
    await this.page.screenshot({
      path: expected,
      clip: {x, y, width, height}
    })

    return [actual, expected]
  }

  /**
   * 获取缺口偏移
   * @param captcha
   * @returns {Promise<number|null>} 返回缺口偏移
   */
  getGap(captcha: string[]): Promise<number[] | undefined> {
    return new Promise((resolve, reject) => {
      const [img1, img2] = captcha
      console.log(img1, img2)
      looksSame(img1, img2, {
        tolerance: 12
      }, (err: any, data: any) => {
        if (err) reject(err)
        console.log(data)
        if (data) {
          const left = data.diffBounds.left
          const right = data.diffBounds.right

          resolve([left + this.tolerance, right - left])
        } else {
          resolve(undefined)
        }
      })
    })
  }

  async moveButton(button: any, track: number[], left: number): Promise<void> {
    const {x, y} = await button.boundingBox()
    await this.page.mouse.move(x + 15, y + 15)
    await this.page.mouse.down()
    await utils.timeout(0.6)
    await this.page.mouse.move(x + left, 0, {steps: 60})

    let count = 0
    while (count < track.length) {
      await this.page.mouse.move(x + left + track[count], 0)
      await utils.timeout(0.01)
      count++
    }

    await utils.timeout(0.6)
    await this.page.mouse.up()
  }

  /**
   * 获取滑动抖动轨迹
   * @param distance {number} 缺块的x坐标
   * @returns {Array<number>}
   */
  getTrack(distance: number): number[] {
    let track: number[] = []
    let count = 0
    while (count < 50) {
      let val = utils.random(1, 5)
      if (count % 2 === 0) {
        track.push(-val)
      } else {
        track.push(val)
      }
      count++
    }
    return track
  }

  /**
   * 刷新验证码
   */
  async refreshCode(button: any): Promise<void> {
    await button.hover()
    let refresh: any = await this.page.$('.gt_refresh_button')
    await utils.timeout(0.5)
    return await refresh.click()
  }

  async getImageBase(button: any): Promise<any> {
    const captcha = await this.getGeetestImage(button)
    let [left] = await this.getGap(captcha)

    return left
  }

  /**
   * 启动
   * @param account {string|Array}
   * @param password {string}
   */
  async start(account: string | [AccountInterface], password?: string): Promise<object> {
    this.account = account
    this.password = password || ''
    let cookies: any = ''

    if (!this.account || !this.password) {
      console.log('未指定账号密码')
      return {
        account,
        password,
        cookies
      }
    }

    try {
      await this.createBrowser()
      // 等待滑动按钮出现
      await this.page.waitForSelector('.gt_slider_knob.gt_show')
      await this.login()
      const button = await this.page.$('.gt_slider_knob.gt_show')

      let left = await this.getImageBase(button)
      const track: number[] = this.getTrack(left)
      let info = await this.page.$('.gt_info_text')
      let pass = ''

      let maxCount = 0
      while (maxCount < 3) {
        await this.moveButton(button, track, left)
        await utils.timeout(3)
        pass = await info.$eval('.gt_info_type', (node: any) => node.innerText)
        maxCount++

        if (pass.indexOf('失败') >= 0) {
          left += 6
          console.log(`验证失败，3s后进行第${maxCount}次验证...`)
          await utils.timeout(1)
        } else if (pass.indexOf('再来') >= 0) {
          console.log('重新验证')
          await utils.timeout(2)
          left = await this.getImageBase(button)
          maxCount = 0
        } else {
          console.log(`验证成功，准备获取Cookie...`)
          maxCount = 3
        }
      }

      info = await this.page.$('#login-app li.remember .text')
      info && (pass = await info.$eval('.tips', (node: any) => node.innerText))
      if (info && pass.indexOf('错误') < 0) {
        await this.page.waitForNavigation({
          waitUntil: 'load'
        })
        cookies = await this.page.cookies()
      } else {
        console.info('账号或密码错误')
      }

      console.log(`程序许执行结束`)
      await this.browser.close()
      // await this.moveButton(button, track, left)
      return {
        account,
        password,
        cookies
      }

    } catch (e) {
      console.error(e)
    }
  }
}
