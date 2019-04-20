import Requests from "../../base/Requests";
import { Hmac, createHmac } from "crypto";

export default class ZhiHu extends Requests {

    loginData : any

    constructor(account : string,password : string){
        super()
        // login api
        this.url = 'https://www.zhihu.com/api/v3/oauth/sign_in'
        this.account = account
        this.password = password

        this.loginData = {
            'client_id': 'c3cef7c66a1843f8b3a9e6a1e3160e20',
            'grant_type': 'password',
            'source': 'com.zhihu.web',
            'username': this.account,
            'password': this.password,
            'lang': 'en',
            'ref_source': 'homepage',
            'utm_source': ''
        }
    }

    async signIn(captchaLang = 'en',loadCookies = true) : Promise<void>{

        /**
         *  模拟登录知乎
        :param captcha_lang: 验证码类型 'en' or 'cn'
        :param load_cookies: 是否读取上次保存的 Cookies
        :return: bool
        * 1. check cookies
        2.
         */

        let headers = {
            'accept-encoding': 'gzip, deflate, br',
            'Host': 'www.zhihu.com',
            'Referer': 'https://www.zhihu.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }

        let timestramp = new Date().getTime()
        this.loginData.lang = captchaLang
        this.loginData.timestramp = timestramp
        this.loginData.signature = this.getSignature(timestramp)
        this.loginData.captcha = this.getCaptcha(captchaLang)

        return await this.rq({
            method:'POST',
            headers:headers,
            fromData : this.loginData,
        })
    }

     getSignature(timestamp : number | string) {
        /**
         *  通过 Hmac 算法计算返回签名
        实际是几个固定字符串加时间戳
        :param timestamp: 时间戳
        :return: 签名

        hmac 用法
        crypto.createHmac(‘sha1’, app_secret).update(args).digest().toString(‘base64’); 
        这样的加密就是hmac-sha1的。之前是因为要加密的参数忘记排序的了。
         */
        let key = 'd1b964811afb40118a12068ff74a12f4'
        let hc = createHmac('sha1',key)
        // 转bytes 可能有问题
        let arg =  this.toUTF8Array(this.loginData.grant_type 
                    + this.loginData.client_id 
                    + this.loginData.source
                    + timestamp.toString())
        return hc.update(arg.toString(),'utf8').digest('hex')
    }

    async getCaptcha(lang = 'en'){
        /**
         * 请求验证码的 API 接口，无论是否需要验证码都需要请求一次
        如果需要验证码会返回图片的 base64 编码
        根据 lang 参数匹配验证码，需要人工输入
        :param lang: 返回验证码的语言(en/cn)
        :return: 验证码的 POST 参数
         */
        let api = `https://www.zhihu.com/api/v3/oauth/captcha?lang=${lang}`
        let resp = await fetch(api)

    }

    /**
     * 字符串转byte 数组
     * @param str
     */
    unpack(str : string) {
        var bytes = [];
        for(var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            bytes.push(char >>> 8);
            bytes.push(char & 0xFF);
        }
        return bytes;
    }

    /**
     * 
     * @param str 字符串转array
     */
    toUTF8Array(str : string)  {
        let utf8 = [];
        for (let i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);
            if (charcode < 0x80) utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6),
                          0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12),
                          0x80 | ((charcode>>6) & 0x3f),
                          0x80 | (charcode & 0x3f));
            }
            // surrogate pair
            else {
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                          | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >>18),
                          0x80 | ((charcode>>12) & 0x3f),
                          0x80 | ((charcode>>6) & 0x3f),
                          0x80 | (charcode & 0x3f));
            }
        }
        return utf8;
    }
    

}