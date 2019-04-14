/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: 腾讯视频
 */

import path from 'path'
import fs from 'fs'
import canvas from 'canvas'
import puppeteer from 'puppeteer'
import looksSame from 'looks-same'
import Requests from '../../base/Requests'
import * as utils from '../../utils/index'

const imagePath = path.resolve(__dirname, `./images`)

export default class QQVideo extends Requests {
  browser: any
  page: any
  // 公差
  tolerance: number = 70
  constructor () {
    super()
    this.url = 'https://v.qq.com/'
    // 创建图片目录
    !fs.existsSync(imagePath) && fs.mkdirSync(imagePath)
  }

  start() {}
}
