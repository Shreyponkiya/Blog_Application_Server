const { validateToken } = require("../services/authentication")

function chackForAuthenticationCookie(cookieName){
    return (req,res,next)=>{
        const tokenCookieValue = req.cookies[cookieName]
        if(!tokenCookieValue){
            return next()
        }
        try{
            const userPayload = validateToken(tokenCookieValue)
            req.user = userPayload;
        }catch(err){}
        return next();
    }
}
module.exports = {chackForAuthenticationCookie}