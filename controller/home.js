module.exports = {
    async getHome (ctx) {
        await ctx.render('index', {
            content: 'home'
        })
    }
}