// imports
import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyparser from 'body-parser';
import cors from 'cors';

// versions
import v1 from './v1';

// load env variables
dotenv.config();

// express
const router = express.Router();
const app = express();
const expressWs = require('express-ws')(app);

// constants
const SERVER_PORT: number = Number(process.env.API_PORT || 7020);

// router.ws('/channel/@me/:channelId', (ws: any, req: Request) => {
//   const params = req.params;

//   ws.send(
//     JSON.stringify({
//       type: 'connection-success',
//       data: {
//         channelId: params.channelId,
//       },
//     })
//   );

//   ws.on('message', (msg: string) => {
//     console.log(msg);

//     if (msg === 'close') {
//       ws.send('closing connection');
//       ws.close();
//     }
//     ws.send(msg);
//   });

//   ws.on('close', () => {
//     console.log('Connection closed');
//   });
// });

// router.ws('/channel/:channelId', (ws: any, req: Request) => {
//   const params = req.params;

//   ws.send(
//     JSON.stringify({
//       type: 'connection-success',
//       data: {
//         channelId: params.channelId,
//       },
//     })
//   );

//   ws.on('message', (msg: string) => {
//     console.log(msg);

//     if (msg === 'close') {
//       ws.send('closing connection');
//       ws.close();
//     }
//     ws.send(msg);
//   });

//   ws.on('close', () => {
//     console.log('Connection closed');
//   });
// });

app.use(bodyparser.json());
app.use(
  cors({
    origin: '*',
  })
);

app.use('/', async (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('content-type', 'application/json');
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    'is-alive': true,
  });
});

app.use('/v1', v1);

app.listen(SERVER_PORT, () => {
  console.log(`Server is listening on port ${SERVER_PORT}`);
});
