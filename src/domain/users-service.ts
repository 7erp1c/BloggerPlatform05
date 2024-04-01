import {createUserAccountThroughAuth, UsersInputType} from "../model/usersType/inputModelTypeUsers";
import bcrypt from 'bcrypt'
import {UsersRepository} from "../repositories/usersRepository";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";



export const UsersService = {

//post(user)
    async createUser(login: string, email: string, password: string): Promise<UsersInputType> {

        const passwordSalt = await bcrypt.genSalt(10)
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
                expirationDate: add(new Date(),{hours:1,minutes:3}),//дата истечения срока
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

    async checkCredentials(loginOrEmail:string, password:string) {
        const user = await UsersRepository.findByLoginOrEmail(loginOrEmail)

        if (!user) {
            return false
        }
        if(!user.accountData.passwordSalt){
            return false
        }
        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        if(user.accountData.passwordHash === passwordHash){
            return user
        }else{
            return null
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
    async findUserById(id:any){
        return await UsersRepository.findUserById(id)
    }
}