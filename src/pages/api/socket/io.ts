import { NextApiResponseServerIo } from '@/lib/types';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { NextApiRequest } from 'next';
import https from 'https';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = '/api/socket/io';
    
    // Use HTTPS server with SSL configuration from environment variables
    const httpsServer = https.createServer({
      key: process.env.SSL_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      cert: process.env.SSL_DOMAIN_CERT!.replace(/\\n/g, '\n'),
    });

    const io = new ServerIO(httpsServer, {
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