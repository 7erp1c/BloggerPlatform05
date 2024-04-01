import { EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import { UsersInputType} from "../model/usersType/inputModelTypeUsers";
import {UsersRepository} from "../repositories/usersRepository";
import {AuthUsersRepository} from "../repositories/authRepository";
export const AuthService = {
    async createUser(login:string,password:string, email:string):Promise<UsersInputType|null>{
        const user = await UsersService.createUser(login,password,email)
        if(!user) {
            return null
        }
        const findUser = await UsersService.findUserById(user.id)

        if(!findUser||!findUser.emailConfirmation) {
            return null
        }
        console.log(findUser.accountData.email + findUser.accountData.login + findUser.emailConfirmation.confirmationCode)
           const sendEmail =   await EmailsManager
               .sendMessageWitchConfirmationCode(findUser.accountData.email,findUser.accountData.login,findUser.emailConfirmation.confirmationCode)
        return user
    },

    async confirmEmail(code:string):Promise<boolean> {
        let user = await UsersRepository.findUserByConfirmationCode(code)
       //если не user, уже подтвердил и т.д.
        if(!user) return false
        if(user.emailConfirmation?.isConfirmed)return false
        if(!user.emailConfirmation||user.emailConfirmation.confirmationCode !== code) return false
        if(user.emailConfirmation.expirationDate < new Date()) return false

        return  await UsersRepository.updateConfirmation(user.id)
    }

}