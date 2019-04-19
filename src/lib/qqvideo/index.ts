/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: 腾讯视频
 */

import path from 'path'
import fs from 'fs'
import {createCanvas, loadImage} from 'canvas'
import puppeteer from 'puppeteer'
import Requests from '../../base/Requests'
import * as utils from '../../utils/index'

const canvas = createCanvas(680, 390)
const ctx = canvas.getContext('2d')
const imagePath = path.resolve(__dirname, `./images`)

export default class QQVideo extends Requests {
  browser: any
  page: any
  // 公差
  tolerance: number = 70
  imageWidth: number = 680
  imageHeight: number = 390

  constructor() {
    super()
    this.url = 'https://v.qq.com/'
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
   * 加载验证码图片，并将其生成RGBA数组
   * @param ele
   */
  async loadImage(ele: any): Promise<any> {
    let url: string = typeof ele === "string" ? ele : await ele.$eval('#slideBg', (node: any) => node.getAttribute('src'))

    if (!ele) {
      return null
    }

    return new Promise((resolve, reject) => {
      loadImage(url).then((image) => {
        console.log(image)

        ctx.drawImage(image, 0, 0, this.imageWidth, this.imageHeight)

        let arr: any = ctx.getImageData(0, 0, this.imageWidth, this.imageHeight)
        resolve(arr.data)
      }).catch((e) => {
        reject(e)
      })
    })
  }

  /**
   * 计算RGB之和
   * @param idx 序号
   * @param arr 全部数据
   */
  computeRgb(idx: number, arr: any): number {
    let rgb: any = arr.slice(idx, idx + 4)
    rgb = rgb[0] + rgb[1] + rgb[2]
    return rgb
  }

  /**
   * 计算斜角的颜色是否正确
   * @param x 坐标
   * @param y 坐标
   * @param arr 全部数据
   */
  computeBevel(x: number, y: number, arr: any): Boolean {
    let isOk = true
    for (let i = 1; i < 88; i++) {
      let rgb = arr[x + i][y + i]
      let rgb2 = arr[x + 88 - i][y + 88 - i]
      if (rgb > 400 || rgb2 > 400) {
        isOk = false
        break
      }
    }
    return isOk
  }

  /**
   * 计算缺块偏移量
   * @param arr
   */
  computeOffset(arr: [any]): number {
    const len = arr.length
    let result: any = []
    let offset: number = 0
    const base: number = 550
    const black: number = 350

    // 循环所有像素点，构建一个虚拟二维坐标系/多维数组
    for (let i = 0; i < len; i += 4) {
      let index = i / 4
      let x = index % this.imageWidth
      let y = Math.floor(index / this.imageWidth)

      let rgb: any = this.computeRgb(i, arr)
      if (!result[x]) {
        result[x] = []
      }

      result[x][y] = rgb
    }

    // 循环虚拟二维坐标，找到符合规则的区域
    let x = 100
    while (x < 580) {
      if (offset > 100) {
        break
      }

      let y = 0
      while (y < 300) {
        if (
          result[x][y] > base
          && result[x + 1][y + 1] < base
          && result[x + 88][y] > base
          && result[x][y + 88] > base
          && result[x + 88][y + 88] > base
          && result[x + 44][y + 44] < black
          && this.computeBevel(x, y, result)
        ) {
          offset = x
          break
        }
        y++
      }

      x++
    }
    return offset
  }

  /**
   * 移动滑块
   * @param button
   * @param left
   */
  async moveButton(button: any, left: number): Promise<void> {
    const {x, y} = await button.boundingBox()
    const movePosition = x + left
    await this.page.mouse.move(x + 15, y + 15)
    await this.page.mouse.down()
    await utils.timeout(0.6)
    await this.page.mouse.move(movePosition, 0, {steps: utils.random(60, 160)})

    await utils.timeout(0.6)
    await this.page.mouse.up()
  }

  /**
   * 登录 - 输入账号密码
   */
  async login(): Promise<any> {
    const mainLoginBtn: string = '#mod_head_notice_trigger'
    const qqLoginBtn: string = 'a.btn_qq._login_type_item'
    await this.createBrowser()
    // 点击主登录按钮
    await this.page.waitForSelector(mainLoginBtn)
    await this.page.click(mainLoginBtn)

    // 点击QQ登录按钮
    await this.page.waitForSelector(qqLoginBtn)
    await this.page.click(qqLoginBtn)

    // 获取登录窗口，并使用账号密码登录
    await utils.timeout(2)
    const loginFrame: any = await this.page.frames().find((frame: any) => frame.name() === 'ptlogin_iframe')
    await loginFrame.waitForSelector('#switcher_plogin')
    await loginFrame.click('#switcher_plogin')

    // 输入账号密码
    // let p = Math.floor(Math.random() * 1000000000)
    await loginFrame.type('#u', this.account, {delay: 100})
    await loginFrame.type('#p', this.password, {delay: 100})
    await loginFrame.click('#login_button')

    // #login_win

    return loginFrame
  }

  /**
   * 启动
   * @param account
   * @param password
   */
  async start(account: string, password: string) {
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
      const loginFrame = await this.login()
      // 获取框架滑动验证码框架，获取验证码图片
      await utils.timeout(2)
      const ctFrame: any = await loginFrame.childFrames().find((frame: any) => frame.name() === 'tcaptcha_iframe')

      // 判断是否有验证码
      if (ctFrame) {
        // 计算验证码图片偏移量
        let offset: number = 0
        let count: number = 0
        while (count < 3 && !offset) {
          await utils.timeout(1)
          let arr: any = await this.loadImage(ctFrame)
          arr && (offset = this.computeOffset(arr))
          count++
        }
        if (offset) {
          offset = Math.ceil(offset * (280 / 680)) * 2
        } else {
          console.log('未计算出滑动偏移量')
          return
        }

        // 获取滑动按钮
        const button = await ctFrame.$('#tcaptcha_drag_button')
        await this.moveButton(button, offset)
      }

      await this.page.waitFor(2000)

      cookies = await this.page.cookies()
      this.cookies = cookies

      /*let arr: any = await this.loadImage(path.resolve(imagePath, './8.jpg'))
      let offset: number = this.computeOffset(arr)
      console.log(offset)*/

      await this.browser.close()
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
