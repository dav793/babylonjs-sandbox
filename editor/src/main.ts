import path from 'path';

import { config } from 'dotenv';
config({ path: path.join(__dirname, '..', 'config', '.env') });

import { HttpServer } from './shared/lib/express/http-server';
import { SocketServer } from './shared/lib/socket.io/socket-server';

const httpServer = new HttpServer();
const socketServer = new SocketServer();
