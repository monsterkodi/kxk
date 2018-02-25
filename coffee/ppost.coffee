# 00000000    0000000    0000000  000000000    
# 000   000  000   000  000          000       
# 00000000   000   000  0000000      000       
# 000        000   000       000     000       
# 000         0000000   0000000      000       

Emitter = require 'events'
POST    = '__POST__'

if process.type == 'renderer'

    electron = require 'electron'
    remote   = electron.remote
    
    # 000   000  000  000   000    
    # 000 0 000  000  0000  000    
    # 000000000  000  000 0 000    
    # 000   000  000  000  0000    
    # 00     00  000  000   000    

    class PostRenderer extends Emitter

        constructor: () ->
            super()
            @dbg = false
            @id  = remote.getCurrentWindow().id
            @ipc = electron.ipcRenderer
            @ipc.on POST, (event, type, argl) => @emit.apply @, [type].concat argl
            window.addEventListener 'beforeunload', @dispose

        dispose: () =>
            window.removeEventListener 'beforeunload', @dispose
            @ipc.removeAllListeners POST
            @ipc = null

        toAll:       (type, args...) -> @send 'toAll',       type, args
        toOthers:    (type, args...) -> @send 'toOthers',    type, args, @id
        toMain:      (type, args...) -> @send 'toMain',      type, args
        toOtherWins: (type, args...) -> @send 'toOtherWins', type, args, @id
        toWins:      (type, args...) -> @send 'toWins',      type, args
        toWin:   (id, type, args...) -> @send 'toWin',       type, args, id
        
        get:         (type, args...) -> @ipc.sendSync POST, 'get', type, args

        debug: (@dbg=['emit', 'toAll', 'toOthers', 'toMain', 'toOtherWins', 'toWins', 'toWin']) ->
            console.log "post.debug id:#{@id}", @dbg

        emit: (type, args...) -> 
            if 'emit' in @dbg then console.log "post.emit #{type}", args.map((a) -> new String(a)).join ' '
            super arguments...
            
        send: (receivers, type, args, id) ->
            if receivers in @dbg then console.log "post.#{receivers} #{type}", args.map((a) -> new String(a)).join ' '
            @ipc.send POST, receivers, type, args, id

    module.exports = new PostRenderer()

else

    # 00     00   0000000   000  000   000  
    # 000   000  000   000  000  0000  000  
    # 000000000  000000000  000  000 0 000  
    # 000 0 000  000   000  000  000  0000  
    # 000   000  000   000  000  000   000  
    
    class PostMain extends Emitter

        constructor: () ->
            super()
            @getCallbacks = {}
            try
                ipc = require('electron').ipcMain
                ipc.on POST, (event, kind, type, argl, id) =>
                    id = id or event.sender.id
                    switch kind
                        when 'toMain'      then @sendToMain type, argl
                        when 'toAll'       then @sendToWins(type, argl).sendToMain(type, argl)
                        when 'toOthers'    then @sendToWins(type, argl, id).sendToMain(type, argl)
                        when 'toOtherWins' then @sendToWins type, argl, id
                        when 'toWins'      then @sendToWins type, argl
                        when 'toWin'       then @toWin.apply @, [id, type].concat argl
                        when 'get'         then event.returnValue = @getCallbacks[type]?.apply @getCallbacks[type], argl

        toAll:  (    type, args...) -> @sendToWins(type, args).sendToMain(type, args)
        toMain: (    type, args...) -> @sendToMain type, args
        toWins: (    type, args...) -> @sendToWins type, args
        toWin:  (id, type, args...) -> require('electron').BrowserWindow.fromId(id)?.webContents.send POST, type, args

        onGet: (type, cb) ->
            @getCallbacks[type] = cb
            @

        sendToMain: (type, argl) ->
            argl.unshift type
            @emit.apply @, argl
            @

        sendToWins: (type, argl, except) ->
            for win in require('electron').BrowserWindow.getAllWindows()
                win.webContents.send(POST, type, argl) if win.id != except
            @

    module.exports = new PostMain()
    