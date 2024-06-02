import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { sessionRouter } from './sessionController';
import { participantRouter } from './participantController';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/sessions', sessionRouter);
app.use('/participants', participantRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
