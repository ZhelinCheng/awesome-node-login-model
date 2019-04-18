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
    // let w = new Bilibili()
    // let data: object = await w.start('13800138001', 'asdasd4565')
    // console.log(data)
    // let w = new Bilibili()
    // let a = Math.floor(Math.random() * 100000000)
    // 3827825
    // await w.start('', '')
    // console.log(w.getCookie())
    // let data: object = await w.start('13800138000', 'asdasd4565')
    // console.log(data)
  })()
}
