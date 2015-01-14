app = require '../app'
io = require('socket.io')(app.server)


chat = io
    .of('/chat')
    .on('connection', (socket)->
        socket.emit('chat', {
            that: 'only a message chat will get'
        })

        socket.on('chat', (data)->
            console.log('here we got a data through socketio: ' + JSON.stringify(data))
        )
        
    )

