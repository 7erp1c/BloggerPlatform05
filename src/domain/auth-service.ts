import {EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import {UsersInputType} from "../model/usersType/inputModelTypeUsers";
import {UsersRepository} from "../repositories/usersRepository";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {JwtService} from "../application/jwt-service";

export const AuthService = {

    async createUser(login: string, password: string, email: string): Promise<UsersInputType | null> {
        const user = await UsersService.createUser(login, password, email)
        if (!user) {
            return null
        }
        const findUser = await UsersQueryRepository.findUserById(user.id)

        if (!findUser || !findUser.emailConfirmation) {
            return null
        }
        console.log(findUser.accountData.email + findUser.accountData.login + findUser.emailConfirmation.confirmationCode)
        const sendEmail = await EmailsManager
            .sendMessageWitchConfirmationCode(findUser.accountData.email, findUser.accountData.login, findUser.emailConfirmation.confirmationCode)
        return user
    },

    async confirmCode(code: string): Promise<{ status: boolean, message: string }> {

        let user = await UsersRepository.findUserByCode(code)

        if (!user) return {status: false, message: `no user in db user: ${user}`};
        if (user.emailConfirmation?.isConfirmed) return {status: false, message: `user is confirmed user: ${user}`};
        if (code !== user.emailConfirmation?.confirmationCode) return {
            status: false,
            message: `code from front differs from code in db codes : ${code} ,${user.emailConfirmation?.confirmationCode}`
        };
        if (user.emailConfirmation.expirationDate < new Date().toISOString()) return {
            status: false,
            message: `date compare failed : ${new Date().toISOString()}, ${user.emailConfirmation.expirationDate}`
        };

        await UsersRepository.updateConfirmation(user.id)
        return {status: true, message: ``}

    },

    async confirmEmail(email: string): Promise<boolean> {

        const newConfirmationCode = uuidv4()
        const newDate = add(new Date(), {hours: 48}).toISOString()

        const isUserUpdated = await UsersRepository.updateUserEmailConfirmationCode(email, newConfirmationCode, newDate)
        if (!isUserUpdated) return false;

        let user = await UsersService.findUserByEmail(email)
        if (!user) return false

        const sendEmail = await EmailsManager
            .sendMessageWitchConfirmationCode(user.accountData.email, user.accountData.login, user.emailConfirmation!.confirmationCode)
        return true
    },

    async refreshToken(oldToken: string) {
        const checkToken = await RefreshTokenRepository.checkToken(oldToken);
        if (!checkToken) {
            return null
        }
        return checkToken
    }
}