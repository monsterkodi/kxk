// monsterkodi/kode 0.200.0

var _k_

var $, elem, post, prefs, slash, _

prefs = require('./kxk').prefs
elem = require('./kxk').elem
post = require('./kxk').post
slash = require('./kxk').slash
$ = require('./kxk').$
_ = require('./kxk')._

class Scheme
{
    static toggle (schemes = ['dark','bright'])
    {
        var currentScheme, link, nextScheme, nextSchemeIndex

        if (link = $('style-link'))
        {
            currentScheme = slash.basename(_.last(link.href.split('/')),'.css')
            nextSchemeIndex = (schemes.indexOf(currentScheme) + 1) % schemes.length
            nextScheme = schemes[nextSchemeIndex]
            return Scheme.set(nextScheme)
        }
    }

    static set (scheme)
    {
        var href, link, newlink

        link = $("#style-link")
        if (!link || !link.parentNode)
        {
            return
        }
        scheme = slash.basename(scheme,'.css')
        prefs.set('scheme',scheme)
        newlink = elem('link',{href:`css/${scheme}.css`,rel:'stylesheet',type:'text/css',id:'style-link'})
        link.parentNode.replaceChild(newlink,link)
        if (link = $("#style-title"))
        {
            href = slash.join(slash.dir(link.href),`${scheme}.css`)
            newlink = elem('link',{href:href,rel:'stylesheet',type:'text/css',id:'style-title'})
            link.parentNode.replaceChild(newlink,link)
        }
        return post.emit('schemeChanged',scheme)
    }
}

module.exports = Scheme