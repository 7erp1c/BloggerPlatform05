import {createUserAccountThroughAuth, UsersInputType} from "../model/usersType/inputModelTypeUsers";
import bcrypt from 'bcrypt'
import {UsersRepository} from "../repositories/usersRepository";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {AuthService} from "./auth-service";
import {ResultStatus} from "../_util/enum";
import {JwtService} from "../application/jwt-service";
import {refreshTokenCollection} from "../db/mongo-db";
import {Result} from "../model/result.type";



export const UsersService = {

//post(user)
    async createUser(login: string,password: string, email: string ): Promise<UsersInputType> {

        const passwordSalt = await bcrypt.genSalt(3)
        const passwordHash = await this._generateHash(password, passwordSalt)
        let newUser: createUserAccountThroughAuth = {
            id: new ObjectId().toString(),
            accountData: {
                login: login,
                email: email,
                passwordHash:passwordHash,
                passwordSalt: passwordSalt,
                createdAt: new Date().toISOString()
            },
            emailConfirmation:{
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(),{hours:48}).toISOString(),//дата истечения срока
                isConfirmed: false
            }

        }
        const createdUser = await UsersRepository.createUser(newUser)

        return   {
            id: createdUser.id,
            login: createdUser.accountData.login,
            email: createdUser.accountData.email,
            createdAt: createdUser.accountData.createdAt
        }

    },

    async checkCredentials(loginOrEmail:string, password:string):Promise<Result<createUserAccountThroughAuth| null>> {
        const user = await UsersRepository.findByLoginOrEmail(loginOrEmail)

        // if (!user) {
        //     return false
        // }
        // if(!user.emailConfirmation?.isConfirmed){
        //     return null
        // }
        // if(!user.accountData.passwordSalt){
        //     return false
        // }

        if(!user||!user.accountData.passwordSalt) return {
            status: ResultStatus.Unauthorized,
            errorMessage: 'User was not found by email and login',
            data: null,
        }
        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        if(user.accountData.passwordHash !== passwordHash)return{
            status: ResultStatus.Unauthorized,
            errorMessage: 'User passwordHash not found',
            data: null,
        }
        const token     = await JwtService.createJWT(user)// создаем токен для Authorisation
        const tokenRefresh = await JwtService.createJWTRefresh(user)//создаем токен для Cookies

        return{
            status: ResultStatus.Success,
            data: user
        }




    },
    async _generateHash(password: string, salt: string) {
        if (!password || !salt) {
            throw new Error('data and salt arguments required');
        }
        const hash = await bcrypt.hash(password, salt);
        console.log('hash' + hash);
        return hash;
    },
//delete(/id)
    async deleteUser(id: string): Promise<boolean> {
        return await UsersRepository.deleteUser(id)
    },
//get(id)

    async findUserByLogin(login:string){
        return   await UsersRepository.findUserByLogin(login)
    },

}

