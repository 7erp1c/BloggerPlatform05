
import { EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import { UsersInputType} from "../model/usersType/inputModelTypeUsers";
export const AuthService = {
    async createUser(login:string,email:string,password:string):Promise<UsersInputType|null>{
        const user = await UsersService.createUser(login,email,password)
        try {
            await EmailsManager.sendPasswordRecoveryMessage(user)
        }catch(error){
            console.log(error)
            //await AuthUsersRepository.deleteUser(user.id)
            return null
        }
        return user
    },

    // async confirmEmail(code:string):Promise<boolean> {
    //     let user = await UsersRepository.findUserByConfirmationCode(code)
    //     if(!user){
    //         return false
    //     }
    //     if(user.emailConfirmation.confirmationCode !== code){
    //         return false
    //     }
    //     let result = await AuthUsersRepository.update
    // }

}