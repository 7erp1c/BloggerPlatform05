import {EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import {UsersInputType} from "../model/usersType/inputModelTypeUsers";
import {UsersRepository} from "../repositories/usersRepository";
import {AuthUsersRepository} from "../repositories/authRepository";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {usersCollection} from "../db/mongo-db";

export const AuthService = {
    async createUser(login: string, password: string, email: string): Promise<UsersInputType | null> {
        const user = await UsersService.createUser(login, password, email)
        if (!user) {
            return null
        }
        const findUser = await UsersService.findUserById(user.id)

        if (!findUser || !findUser.emailConfirmation) {
            return null
        }
        console.log(findUser.accountData.email + findUser.accountData.login + findUser.emailConfirmation.confirmationCode)
        const sendEmail = await EmailsManager
            .sendMessageWitchConfirmationCode(findUser.accountData.email, findUser.accountData.login, findUser.emailConfirmation.confirmationCode)
        return user
    },

    async confirmCode(code: string): Promise<boolean> {
        let user = await UsersRepository.findUserByConfirmationCode(code)
        //если не user, уже подтвердил и т.д.
        if (!user) return false

        if (user.emailConfirmation?.isConfirmed) return false
        if (!user.emailConfirmation || user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate < new Date()) return false
        const regex = new RegExp("[0-9a-f\\-]+")
        // if(!regex.test(user.emailConfirmation.confirmationCode)) {
        //     return {er}
        // }
        //console.log(user.accountData.email + user.accountData.login + user.emailConfirmation.confirmationCode)
        const sendEmail = await EmailsManager
            .sendMessageWitchConfirmationCode(user.accountData.email, user.accountData.login, user.emailConfirmation.confirmationCode)

        return await UsersRepository.updateConfirmation(user.id)
    },

    async confirmEmail(email: string): Promise<boolean> {
        //create code:
        const newConfirmationCode =  await this._createConfirmationCode(email);
        console.log("newConfirmationCode: " + newConfirmationCode)
        //update code:
        const isUserUpdated = await UsersRepository.updateUserEmailConfirmationCode( email, newConfirmationCode)
        console.log("isUserUpdated: " + isUserUpdated)
        if (!isUserUpdated) return false;
        //send user:
        let user = await UsersService.findUserByEmail(email)
        console.log("user: " + user)
        //если не user, уже подтвердил и т.д.
        if (!user) return false
        //send message:
        const sendEmail =  await EmailsManager
            .sendMessageWitchConfirmationCode(user.accountData.email, user.accountData.login, user.emailConfirmation!.confirmationCode)
        return true
    },

    async  _createConfirmationCode(email: string, lifeTime: {} = {hours: 48}) {
    const confirmationCodeExpiration = add(new Date, lifeTime).toISOString()
    return `${btoa(uuidv4())}:${btoa(email)}:${btoa(confirmationCodeExpiration)}`
}

}