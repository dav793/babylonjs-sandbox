import express from 'express';

export class HttpServer {

    server: express.Application;

    constructor() {
        this.server = express();

        this.server.get('/', (req, res) => {
            res.send('Hello World!');
        });
          
        this.server.listen(process.env.HTTP_PORT, () => {
            console.log(`HTTP server is listening on port ${process.env.HTTP_PORT}`);
        });
    }

}