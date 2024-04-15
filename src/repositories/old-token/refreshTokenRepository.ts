import {OldTokenDB} from "../../model/authType/authType";
import {db} from "../../db/db";


export const RefreshTokenRepository =  {

     async addToken(createToken:OldTokenDB){
        const isSuccess = await db.getCollections().refreshTokenCollection
            .insertOne(createToken);
        return !!isSuccess;//!! - converts boolean
    },
    async updateRefreshValid(token:string){
            const result = await db.getCollections().refreshTokenCollection
                .updateOne({oldToken:token},{$set:{isValid:false}})
            return result.matchedCount === 1
    },

     async checkToken(token:string){
        const isExist = await db.getCollections().refreshTokenCollection
            .findOne({oldToken:token});
        return !!isExist
    },
    async invalidateToken(token:string){
         const checkToken = await db.getCollections().refreshTokenCollection.findOne({ oldToken:token})
        return checkToken?.isValid
    }
}