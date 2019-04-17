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
   * 加载验证码图片，并将其生成RGBA数组
   * @param url
   */
  loadImage(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      loadImage(url).then((image) => {
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
   * @param arr
   */
  computeRgb(idx: number, arr: any): number {
    let rgb: any = arr.slice(idx, idx + 4)
    rgb = rgb[0] + rgb[1] + rgb[2]
    return rgb
  }

  /**
   * 计算缺块偏移量
   * @param arr
   */
  computeOffset(arr: [any]): number {
    const len = arr.length
    let result: any = []
    let offset: number = 0

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
    let i = 100;
    while (i < 580) {
      if (offset > 100) {
        break
      }

      let col: number[] = result[i]
      let j = 0
      while (j < 300) {
        let item = col[j]
        // 向下三像素
        let itemNext = col[j + 3]

        // 斜角像素
        let colRight = result[i + 1]
        let itemRight = colRight[j + 1]

        // 当前位置正确，斜角正确，当前位置向下88像素正确
        if (item > 700 && itemRight <= 700 && col[j + 88] > 700) {
          col = result[i + 88]
          item = col[j]

          // 当前位置向右88像素正确
          if (item > 700 && itemNext > 700) {
            col = result[i + 44]
            item = col[j + 44]
            if (item <= 700 && result[i][j] > 700) {
              offset = i
              break;
            }
          }
        }
        j++
      }

      i++
    }
    console.timeEnd('test')
    return offset
  }

  /**
   * 获取滑动抖动轨迹
   * @param distance {number} 缺块的x坐标
   * @returns {Array<number>}
   */
  getTrack(distance: number): number[] {
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
   * 移动滑块
   * @param button
   * @param track
   * @param left
   */
  async moveButton(button: any, track: number[], left: number): Promise<void> {
    const {x, y} = await button.boundingBox()
    const movePosition = x + left
    await this.page.mouse.move(x + 15, y + 15)
    await this.page.mouse.down()
    await utils.timeout(0.6)
    await this.page.mouse.move(movePosition, 0, {steps: 60})

    let count = 0
    while (count < track.length) {
      await this.page.mouse.move(movePosition + track[count], 0)
      await utils.timeout(0.01)
      count++
    }

    await utils.timeout(0.6)
    await this.page.mouse.up()
  }

  async start() {
    try {
      /*const mainLoginBtn: string = '#mod_head_notice_trigger'
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
      let p = Math.floor(Math.random() * 1000000000)
      console.log(p)
      await loginFrame.type('#u', p.toString(), { delay: 100 })
      await loginFrame.type('#p', '3453345d33ds.', { delay: 100 })
      await loginFrame.click('#login_button')

      // 获取框架滑动验证码框架，获取验证码图片
      await utils.timeout(2)
      const ctFrame: any = await loginFrame.childFrames().find((frame: any) => frame.name() === 'tcaptcha_iframe')
      let ctImg = await ctFrame.$eval('#slideBg', (node: any) => node.getAttribute('src'))


      // 680 280
      // 计算验证码图片偏移量
      let arr: any = await this.loadImage(ctImg)
      let offset: number = this.computeOffset(arr)
      console.log(offset)
      offset = Math.ceil(offset * (280 / 680))
      console.log(offset)

      // 获取滑动按钮
      const button = await ctFrame.$('#tcaptcha_drag_button')
      const track: number[] = this.getTrack(offset - 30)
      await this.moveButton(button, track, offset)*/


      let arr: any = await this.loadImage(path.resolve(imagePath, './2.jpg'))
      let offset: number = this.computeOffset(arr)
      console.log(offset)
    } catch (e) {
      console.error(e)
    }
  }
}
