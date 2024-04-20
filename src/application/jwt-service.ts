import jwt from 'jsonwebtoken';
import {settings} from "../setting";
import {ObjectId} from "mongodb";
import {connectMongoDb} from "../db/connect-mongo-db";
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";
import {v4 as uuidv4} from "uuid";
import {RefreshTokenPayloadType} from "../model/authType/authType";


export const JwtService = {
    async addTokenInDB(token: string) {
        const createToken = {
            oldToken: token,
            isValid: true,
        }
        const oldToken = await RefreshTokenRepository.addToken(createToken)
        if (!oldToken) return null
        return true
    },

    async createJWT(id: string) {
        return jwt
            .sign({userId: id/*,valid: true*/}, settings.JWT_SECRET, {expiresIn: '10s'})
    },
    async createJWTRefresh(id: string) {
        const deviceId = uuidv4()
        return jwt
            .sign({userId: id, deviceId: deviceId}, settings.JWT_SECRET, {expiresIn: '20s'})
    },
    //userId in global variable
    async getIdFromToken(token: string) {
        console.log("getIdFromToken(token:string)______" + token)
        try { //достаём из token userId
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return (new ObjectId((result.userId))).toString()

        } catch (error) {
            return null
        }
    },
    async updateDBJWT() {
        await connectMongoDb.getCollections().refreshTokenCollection.updateMany({}, {$set: {isValid: false}});

    },
    async decode(token: string) {
        return jwt.decode(token)
    },

    async decodeRefreshToken(token: string): Promise<RefreshTokenPayloadType | null> {

        const decodedToken: any = await JwtService.decode(token);
        if (!decodedToken) return null;
        return {
            userId: decodedToken.userId,
            deviceId: decodedToken.deviceId,
            iat: decodedToken.iat,
            exp: decodedToken.exp
        }
    }


}