function makeid(length) {
    let result = "";
    let chars = "ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charsLen = chars.length;
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charsLen));
    }

    return result;
}

module.exports = {makeid};