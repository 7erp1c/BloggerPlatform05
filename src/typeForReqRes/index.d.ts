
import {UsersOutputType} from "../model/usersType/inputModelTypeUsers";

declare global {
    namespace Express {
        export interface Request {
            userId:  string | null
            user?: UsersOutputType|null
            userIp?: string
        }
    }
}