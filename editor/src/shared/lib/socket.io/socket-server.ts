import { Server } from 'socket.io';

export class SocketServer {

    server: Server;

    constructor() {
        this.server = new Server({
            cors: {
                origin: `http://localhost:4200`,    // sub this for the configurable address
                methods: ['GET', 'POST']
            }
        });

        this.server.on('connection', (socket) => {
            console.log('New socket connection established');
        });

        this.server.listen( parseInt(process.env.WS_PORT) );
        console.log(`WS server is listening on port ${process.env.WS_PORT}`);
    }

}
