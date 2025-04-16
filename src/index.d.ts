// types/express/index.d.ts
import  UserDocument  from './models/User'; // adjust if needed

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
