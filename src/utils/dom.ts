/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: dom
 */

interface Interface {
  top: string | null,
  left: string | null
}

export default {
  offset(el: any): Interface {
    let rect = el.getBoundingClientRect();
    return {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft
    }
  }
}
