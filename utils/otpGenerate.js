let otp = ''
const generateOtp = ()=>{
    var otp = Math.floor(100000 + Math.random() * 900000);
    return String(otp)
}
module.exports =  generateOtp