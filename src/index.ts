import Bilibili from './lib/bilibili'
import Weibo from './lib/weibo'
import QQVideo from './lib/QQVideo'

export {
  Bilibili,
  Weibo,

}

if (require.main === module) {
  (async function () {
    // let w = new Bilibili()
    // let data: object = await w.start('13800138000', 'asdasd4565')
    // console.log(data)
    let w = new QQVideo()
    await w.start()
    // let data: object = await w.start('13800138000', 'asdasd4565')
    // console.log(data)
  })()
}
