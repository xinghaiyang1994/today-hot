module.exports = {
    checkLogin: ctx => {
        if (!ctx.session || !ctx.session.name) {
            throw new Error('用户未登录，请登录后再试!')
        }
    }
}