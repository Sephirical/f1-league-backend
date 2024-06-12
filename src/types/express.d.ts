// express.d.ts
import { Request } from 'express';

export interface getUserAuth extends Request {
  user?: any;
}