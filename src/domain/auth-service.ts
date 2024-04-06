import {EmailsManager} from "../managers/email-manager";
import {UsersService} from "./users-service";
import {UsersInputType} from "../model/usersType/inputModelTypeUsers";
import {UsersRepository} from "../repositories/usersRepository";

import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";
import jwt from "jsonwebtoken";
import {JwtService} from "../application/jwt-service";

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



// const newAccessAndRefreshToken = JwtService.createJWT()
//         try {
//             const result:any = jwt.verify(oldToken, process.env.);
//
//             const accessToken = this._createNewAccessToken(result.userId);
//             const refreshToken = this._createNewRefreshToken(result.userId);
//             return {accessToken: accessToken, refreshToken: refreshToken}
//         }catch (err){
//             return null
//         }


    },
//________________________________Additionally:

    async _createConfirmationCode(email: string, lifeTime: {} = {hours: 48}) {

        // const expirationDate  = add(new Date(), lifeTime);
        // const confirmationCodeExpiration = expirationDate.toISOString().slice(0, -5)
        // const base64Encode = (value: string) => Buffer.from(value).toString('base64');
        //
        //
        // const code = `${uuidv4()}:${email}:${confirmationCodeExpiration}`;
        //  return  base64Encode(code);

    },
    async _confirmationCodeToData(code: string) {

        // const decodedData = Buffer.from(code, 'base64').toString('utf-8'); // Декодирование строки из Base64
        // console.log("DECODE:   "+decodedData)
        // const firstColonIndex = decodedData.indexOf(':');
        // const secondColonIndex = decodedData.indexOf(':', firstColonIndex + 1);
        //
        // // Получаем части строки
        // const part1 = decodedData.substring(0, firstColonIndex);
        // const part2 = decodedData.substring(firstColonIndex + 1, secondColonIndex);
        // const part3 = decodedData.substring(secondColonIndex + 1);
        //
        // const pars = {
        //     confirmationCode: part1,
        //     userEmail: part2,
        //     expirationDate: part3
        // };
        //
        // console.log("CODE:   "+pars.confirmationCode);
        // console.log("CODE:   "+pars.userEmail);
        // console.log("CODE:   "+pars.expirationDate);
        //
        // return pars;

        // try {
        //     const mappedCode = code.split(":").map(el => atob(el));
        //     if (mappedCode.length === 3) {
        //         return {
        //             confirmationCode: mappedCode[0],
        //             userEmail: mappedCode[1],
        //             expirationDate: mappedCode[2]
        //         }
        //     }
        //     return null
        // } catch (err) {
        //     console.error(err)
        //         console.error(code.split(":").map(el => atob(el)))
        //     return null
        // }
    }

}