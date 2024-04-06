import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";

export type authView = {
    loginOrEmail: string,
    password: string
}

export type getAuthType = {
    email: string ,
    login: string ,
    userId: string
}
export type accessTokenAndRefreshToken= {
    accessToken: string
    refreshToken: string
}
 export interface OldTokenDB {
    oldToken: string,
    isValid: boolean
}
