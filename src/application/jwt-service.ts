import jwt from 'jsonwebtoken';
import {settings} from "../setting";
import {ObjectId} from "mongodb";
import {connectMongoDb} from "../db/connect-mongo-db";
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";



export const JwtService = {
    async addTokenInDB(token:string){
        const createToken = {
            oldToken: token,
            isValid: true,
        }
        const oldToken = await RefreshTokenRepository.addToken(createToken)
        if(!oldToken)return null
        return true
    },

    async createJWT(id: string) {
        return jwt
            .sign({userId: id/*,valid: true*/}, settings.JWT_SECRET, {expiresIn: '10s'})
    },
    async createJWTRefresh(id: string) {
        return jwt
            .sign({userId: id/*, valid: true*/}, settings.JWT_SECRET, {expiresIn: '20s'})
    },

    async getIdFromToken(token:string){
        console.log("getIdFromToken(token:string)______" + token)
        try{ //достаём из token userId
            const result: any = jwt.verify(token,settings.JWT_SECRET)
            return (new ObjectId((result.userId))).toString()

        }catch (error){
            return null
        }
    },
    async updateDBJWT(){
        const allUpdateOldRefreshJWT = await connectMongoDb.getCollections().refreshTokenCollection.updateMany({}, { $set: { isValid: false } });

    }



}