import jwt from 'jsonwebtoken';
import {createUserAccountThroughAuth} from "../model/usersType/inputModelTypeUsers";
import {settings} from "../setting";
import {ObjectId} from "mongodb";


export const JwtService = {

    async createJWT(user:createUserAccountThroughAuth) {
        return jwt.sign({userId: user.id}, settings.JWT_SECRET, {expiresIn: '24h'})
    },

    async getUserIdByToken(token:string){
        try{
            const result: any = jwt.verify(token,settings.JWT_SECRET)
            return new ObjectId(result.userId)

        }catch (error){
            return null
        }
    }


}