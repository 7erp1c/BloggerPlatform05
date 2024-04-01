import { EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import { UsersInputType} from "../model/usersType/inputModelTypeUsers";
import {UsersRepository} from "../repositories/usersRepository";
import {AuthUsersRepository} from "../repositories/authRepository";
export const AuthService = {
    async createUser(login:string,email:string,password:string):Promise<UsersInputType|null>{
        const user = await UsersService.createUser(login,email,password)
        try {
            await EmailsManager.sendMessageWitchConfirmationCode(user)
        }catch(error){
            console.log(error)
            await AuthUsersRepository.deleteUser(user.id)
            return null
        }
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