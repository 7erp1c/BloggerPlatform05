import {Request, Response, Router} from "express";
import {UsersService} from "../domain/users-service";
import {authView, getAuthType} from "../model/authType/authType";
import {RequestWithUsers} from "../typeForReqRes/helperTypeForReq";
import {JwtService} from "../application/jwt-service";
import {authTokenMiddleware} from "../middleware/authTokenUser";
import {
    authCodeValidation,
    authEmailValidation,
    authValidation,
    usersValidation
} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {AuthService} from "../domain/auth-service";


export const authRouter = Router({})
authRouter
    .post('/login', authValidation, errorsValidation, async (req: RequestWithUsers<authView>, res: Response) => {
        const {loginOrEmail, password} = req.body;
        if (!loginOrEmail || !password) {
            return res.sendStatus(401)
        }
        const user = await UsersService.checkCredentials(loginOrEmail, password)

        if (!user) {
            return res.sendStatus(401)
        }

        const token = await JwtService.createJWT(user)
        return res.status(200).send({
            "accessToken": token
        })

    })

    //регистрация и подтверждение
    .post('/registration-confirmation',authCodeValidation, errorsValidation, async (req: Request, res: Response) => {
        const {code} = req.body
        const result = await AuthService.confirmCode(code)

        if (!result.status) {
            res.status(400).json({
                errorsMessages: [//result.message
                    {
                    message: "Invalid code or expiration date expired",
                    field: "code"
                }]
            });
            return;
        }
        return res.status(204).send(result + " Email was verified. Account was activated")
    })

    .post('/registration', usersValidation, errorsValidation, async (req: Request, res: Response) => {

        const {login, email, password} = req.body

        const user = await AuthService.createUser(login, password, email)
        if (!user) {
            return res.sendStatus(400)
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(204).json({user, message: 'Input data is accepted. Email with confirmation code will be sent to the provided email address.'});

    })

    //повторная отправка email
    .post('/registration-email-resending', authEmailValidation, errorsValidation, async (req: Request, res: Response) => {
        const {email} = req.body
        const searchEmailInDbUser =  UsersService.findUserByEmail(email)
        if(!searchEmailInDbUser){
            return res.status(400).json({
                errorsMessages:[{
                    message: "Invalid code or expiration date expired",
                    field: "email"
                }]
        })}
        const result = await AuthService.confirmEmail(email)
        if (!result) {
            return res.sendStatus(500);
        }
        return res.status(204).send(result + " Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere")
    })

    .get('/me', authTokenMiddleware, async (req: Request, res: Response) => {

        if (!req.headers.authorization) {
            return res.status(401).send('Unauthorized');
        }
        const token = req.headers.authorization?.split(' ')[1];

        const userId = await JwtService.getUserIdByToken(token);

        const id = userId ? userId.toHexString() : null;
        if (!id) {
            return res.status(401).send('Unauthorized');
        }

        const user = await UsersService.findUserById(id);
        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        const responseData: getAuthType = {
            email: user.accountData.email,
            login: user.accountData.login,
            userId: user.id
        }
        return res.status(200).send(responseData);

    })