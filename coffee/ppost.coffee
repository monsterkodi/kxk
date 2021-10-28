###
00000000    0000000    0000000  000000000    
000   000  000   000  000          000       
00000000   000   000  0000000      000       
000        000   000       000     000       
000         0000000   0000000      000       
###
_        = require 'lodash'
Emitter  = require 'events'
POST     = '__POST__'

if process.type == 'renderer'
    
    electron = require 'electron'

    # 000   000  000  000   000    
    # 000 0 000  000  0000  000    
    # 000000000  000  000 0 000    
    # 000   000  000  000  0000    
    # 00     00  000  000   000    

    class PostRenderer extends Emitter

        @: ->
            super()
            @ipc = electron.ipcRenderer
            @ipc.on POST, (event, type, argl) => @emit.apply @, [type].concat argl
            window.addEventListener 'beforeunload' @dispose

        dispose: =>
            window.removeEventListener 'beforeunload' @dispose
            @ipc.removeAllListeners POST
            @ipc = null

        toAll:       (type, args...) -> @send 'toAll'       type, args
        toMain:      (type, args...) -> @send 'toMain'      type, args
        toOtherWins: (type, args...) -> @send 'toOtherWins' type, args
        
        get:         (type, args...) -> @ipc.sendSync POST, 'get' type, args
            
        send: (receivers, type, args, id) -> @ipc?.send POST, receivers, type, args, id

    module.exports = new PostRenderer()

else if process.type == 'browser'

    electron = require 'electron'
    
    # 00     00   0000000   000  000   000  
    # 000   000  000   000  000  0000  000  
    # 000000000  000000000  000  000 0 000  
    # 000 0 000  000   000  000  000  0000  
    # 000   000  000   000  000  000   000  
    
    class PostMain extends Emitter

        @: ->
            super()
            @getCallbacks = {}
            try
                ipc = electron.ipcMain
                ipc.on POST, (event, kind, type, argl) =>
                    id = electron.BrowserWindow.fromWebContents(event.sender).id
                    switch kind
                        when 'toAll'       then @sendToWins(type, argl).sendToMain(type, argl)
                        when 'toMain'      then @sendToMain type, argl
                        when 'toOtherWins' then @sendToWins type, argl, id
                        when 'get'
                            if type == 'winID'
                                event.returnValue = id
                            else if _.isFunction @getCallbacks[type]
                                retval = @getCallbacks[type].apply @getCallbacks[type], argl
                                event.returnValue = retval ? []
            catch err
                kerror err # this module should not be used without electron!

        toAll:  (    type, args...) -> @sendToWins(type, args); @sendToMain(type, args)
        toMain: (    type, args...) -> @sendToMain type, args
        toWins: (    type, args...) -> @sendToWins type, args
        toWin:  (id, type, args...) -> 
            if _.isNumber(id) then w = electron.BrowserWindow.fromId id
            else w = id
            w?.webContents?.send POST, type, args

        onGet: (type, cb) -> @getCallbacks[type] = cb
            
        get: (type) -> @getCallbacks[type]()

        sendToMain: (type, argl) ->
            argl.unshift type
            @emit.apply @, argl

        sendToWins: (type, argl, except) ->
            for win in electron.BrowserWindow.getAllWindows()
                if win.id != except
                    win.webContents.send(POST, type, argl) 
            
    module.exports = new PostMain()
    
