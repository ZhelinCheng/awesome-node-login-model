/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: index
 */

import SlidingVerificationCode from '../_public/SlidingVerificationCode'

class Bilibili extends SlidingVerificationCode {
  constructor() {
    super()
  }
}

const bi: Bilibili = new Bilibili()
console.log(bi.getName('1111'))

export default Bilibili
