import {EmailAdapter} from "../adapters/email-adapter";
import {ObjectId} from "mongodb";


export const EmailsManager ={
    async  sendMessageWitchConfirmationCode(user:any){
//отправку сообщения лучше обернуть в try-catch, чтобы при ошибке(например отвалиться отправка) приложение не падало
        try {
            await EmailAdapter.sendEmail(//отправить сообщение на почту юзера с кодом подтверждения
                user.accountData.email,
                user.accountData.login,
                user.emailConfirmation.confirmationCode
        )

        } catch (e: unknown) {
            console.error('Send email error', e); //залогировать ошибку при отправке сообщения
        }

    }
}