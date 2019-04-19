import Requests from "../../base/Requests";

export default class ZhiHu extends Requests {

    constructor(account : string,password : string){
        super()
        // login api
        this.url = 'https://www.zhihu.com/api/v3/oauth/sign_in'
        this.account = account
        this.password = password
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
        
        let fromData = {
            'client_id': 'c3cef7c66a1843f8b3a9e6a1e3160e20',
            'grant_type': 'password',
            'source': 'com.zhihu.web',
            'username': this.account,
            'password': this.password,
            'lang': captchaLang,
            'ref_source': 'homepage',
            'utm_source': ''
        }

        let timestramp = new Date().getTime()

        // fromData.timestramp = timestramp


        return await this.rq({
            method:'POST',
            headers:headers,
            fromData : fromData,
        })
    }

}