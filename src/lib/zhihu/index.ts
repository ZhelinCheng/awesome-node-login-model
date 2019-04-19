import Requests from "../../base/Requests";

interface AccountInterface {
    readonly a : string,
    readonly p : string,
}

export default class ZhiHu extends Requests {

    constructor(){
        super()
        // login api
        this.url = 'https://www.zhihu.com/api/v3/oauth/sign_in'
    }

    async signIn(account : string | [AccountInterface],password? : string) : Promise<void>{
        this.account = account
        this.password = password || ''

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
            'username': '',
            'password': '',
            'lang': 'en',
            'ref_source': 'homepage',
            'utm_source': ''
        }

        return await this.rq({
            method:'POST',
            headers:headers,
            fromData : fromData,
        })
    }

}