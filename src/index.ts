import Bilibili from './lib/bilibili'

export default {
  Bilibili
}

if (require.main === module) {
  let bi = new Bilibili('13800138000', 'qwe1234567.')
  bi.crack()
}
