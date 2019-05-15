import Bilibili from './lib/bilibili'
import Weibo from './lib/weibo'
import QQVideo from './lib/qqvideo'

export {
  Bilibili,
  Weibo,
  QQVideo
}

if (require.main === module) {
  (async function () {
    /*let w = new QQVideo()
    let a = Math.floor(Math.random() * 10000000)
    await w.start(a.toString(), '556s5ds5d2c')*/
  })()
}
