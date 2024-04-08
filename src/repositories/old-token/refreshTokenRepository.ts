import {blogCollection, refreshTokenCollection} from "../../db/mongo-db";
import {OldTokenDB} from "../../model/authType/authType";
import jwt from "jsonwebtoken";
import {settings} from "../../setting";
import { JwtPayload } from 'jsonwebtoken'


export const RefreshTokenRepository =  {

     async addToken(createToken:OldTokenDB){
        const isSuccess = await refreshTokenCollection
            .insertOne(createToken);
        return !!isSuccess;//!! - converts boolean
    },
    async updateRefreshValid(token:string){
            const result = await refreshTokenCollection
                .updateOne({oldToken:token},{$set:{isValid:false}})
            return result.matchedCount === 1
    },

     async checkToken(token:string){
        const isExist = await refreshTokenCollection
            .findOne({oldToken:token});
        return !!isExist
    },
    async invalidateToken(token:string){
         const checkToken = await refreshTokenCollection.findOne({ oldToken:token})
        return checkToken?.isValid
    }
}