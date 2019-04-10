import Bilibili from './lib/bilibili'
import Weibo from './lib/weibo'

export default {
  Bilibili,
  Weibo
}

 if (require.main === module) {
  let w = new Weibo('1111', '1111')
  // w.crack()
}
