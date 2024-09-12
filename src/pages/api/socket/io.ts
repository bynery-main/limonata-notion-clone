import { NextApiResponseServerIo } from '@/lib/types';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiRequest } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = '/api/socket/io';
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || 'https://limonata.app',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket'],
    });

    io.on('connection', (socket) => {
      console.log('New client connected');
      socket.on('create-room', (fileId) => {
        console.log(`Client joined room: ${fileId}`);
        socket.join(fileId);
      });
      socket.on('send-changes', (delta, fileId) => {
        console.log(`Changes received for file: ${fileId}`);
        socket.to(fileId).emit(`receive-changes-${fileId}`, delta);
      });
      socket.on('send-cursor-move', (range, fileId, cursorId) => {
        console.log(`Cursor move received for file: ${fileId}, cursor: ${cursorId}`);
        socket.to(fileId).emit(`receive-cursor-move-${fileId}`, range, cursorId);
      });
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;