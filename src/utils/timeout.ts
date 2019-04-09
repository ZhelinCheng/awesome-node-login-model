/**
 * Created by ChengZheLin on 2019/4/9.
 * Features: timeout
 */
export default function (second: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, second * 1000)
  })
}
