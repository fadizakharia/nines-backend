import { Server } from "socket.io";

declare module "express-session" {
  interface Session {
    user: { [key: string]: any };
  }
}
declare global {
  namespace Express {
    export interface Request {
      io?: Server;
    }
  }
}
