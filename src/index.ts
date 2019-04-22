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
    let w = new QQVideo()
    await w.start('', '')
  })()
}
