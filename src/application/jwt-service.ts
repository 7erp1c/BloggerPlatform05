import jwt from 'jsonwebtoken';
import {createUserAccountThroughAuth} from "../model/usersType/inputModelTypeUsers";
import {settings} from "../setting";
import {ObjectId} from "mongodb";
import {OldTokenDB} from "../model/authType/authType";
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

    async createJWT(user:createUserAccountThroughAuth) {
        return jwt
            .sign({userId: user.id/*,valid: true*/}, settings.JWT_SECRET, {expiresIn: '10s'})
    },
    async createJWTRefresh(user:createUserAccountThroughAuth) {
        return jwt
            .sign({userId: user.id/*, valid: true*/}, settings.JWT_SECRET, {expiresIn: '20s'})
    },

    async getIdFromToken(token:string){
        try{ //достаём из token userId
            const result: any = jwt.verify(token,settings.JWT_SECRET)
            return (new ObjectId((result.userId))).toString()

        }catch (error){
            return null
        }
    }



}