import { UserDocument, UserType } from "../../src/models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      tokenExpiryDate?: Date;
      resource?: any;
    }
  }
}
