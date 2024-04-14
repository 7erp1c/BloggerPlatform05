import {EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import {UsersInputType} from "../model/usersType/inputModelTypeUsers";
import {UsersRepository} from "../repositories/usersRepository";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";


export const AuthService = {

    async createUser(login: string, password: string, email: string): Promise<UsersInputType | null> {
        const user = await UsersService.createUser(login, password, email)
        if (!user) {
            return null
        }
        const findUser = await UsersQueryRepository.findUserByIdAllModel(user.id)

        if (!findUser || !findUser.data?.emailConfirmation) {
            return null
        }

        const sendEmail = await EmailsManager
            .sendMessageWitchConfirmationCode(findUser.data.accountData.email, findUser.data.accountData.login, findUser.data.emailConfirmation.confirmationCode)
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

    async confirmEmail(email: string): Promise<{ status: boolean, message: string }>{

        const newConfirmationCode = uuidv4()
        const newDate = add(new Date(), {hours: 48}).toISOString()

        const isUserUpdated = await UsersRepository.updateUserEmailConfirmationCode(email, newConfirmationCode, newDate)
        if (!isUserUpdated) return {status: false, message: `user is confirmed user: ${isUserUpdated}`};

        let user = await UsersQueryRepository.findUserByEmail(email)
        if (!user) return {status: false, message: `user is confirmed user: ${user}`};

        const sendEmail = await EmailsManager
            .sendMessageWitchConfirmationCode(user.accountData.email, user.accountData.login, user.emailConfirmation!.confirmationCode)
        return {status: true, message: ``}
    },

    async refreshToken(oldToken: string) {
        const checkToken = await RefreshTokenRepository.checkToken(oldToken);
        if (!checkToken) {
            return null
        }
        return checkToken
    }
}