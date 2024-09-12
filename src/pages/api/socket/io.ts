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
    });
    io.on('connection', (socket) => {
      socket.on('create-room', (fileId) => {
        socket.join(fileId);
      });
      socket.on('send-changes', (delta, fileId) => {
        socket.to(fileId).emit(`receive-changes-${fileId}`, delta);
      });
      socket.on('send-cursor-move', (range, fileId, cursorId) => {
        socket.to(fileId).emit(`receive-cursor-move-${fileId}`, range, cursorId);
      });
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;