import {Request, Response, Router} from "express";
import {UsersService} from "../domain/users-service";
import {authView} from "../model/authType/authType";
import {RequestWithUsers} from "../typeForReqRes/helperTypeForReq";
import {JwtService} from "../application/jwt-service";
import {authTokenMiddleware} from "../middleware/authMiddleware/authTokenUser";
import {
    authCodeValidation,
    authEmailValidation,
    authValidation,
    usersValidation
} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {AuthService} from "../domain/auth-service";
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {refreshTokenCollection} from "../db/mongo-db";
import {CommentsService} from "../domain/comments/comments-service";
import {ResultStatus} from "../_util/enum";
import {createUserAccountThroughAuth} from "../model/usersType/inputModelTypeUsers";
import {Result} from "../model/result.type";
import {authRefreshTokenMiddleware} from "../middleware/authMiddleware/authRefreshTokenUser";
import {authTokenLogoutMiddleware} from "../middleware/authMiddleware/authLogoutUser";


export const authRouter = Router({})
authRouter
    .post('/login', authValidation, errorsValidation, async (req: RequestWithUsers<authView>, res: Response) => {
        const {loginOrEmail, password} = req.body;

        const user = await UsersService.checkCredentials(loginOrEmail, password)//находим user
        if (!user.data || user.status === ResultStatus.Unauthorized) return res.sendStatus(401)

        const token = await JwtService.createJWT(user.data.id)// создаем токен для Authorisation
        const tokenRefresh = await JwtService.createJWTRefresh(user.data.id)//создаем токен для Cookies
        //
        await JwtService.updateDBJWT();
        await JwtService.addTokenInDB(tokenRefresh)//добавляем cookies Token в DB


        res.cookie('refreshToken', tokenRefresh, {httpOnly: true, secure: true})//передаем в cookie token
        return res.status(200).send({
            "accessToken": token
        })

    })

    .post('/refresh-token', authRefreshTokenMiddleware, async (req: Request, res: Response) => {
        if (!req.userId) return res.sendStatus(401)

        // res.clearCookie('refreshToken');
        const accessToken = await JwtService.createJWT(req.userId)// создаем токен для Authorisation
        const tokenRefresh = await JwtService.createJWTRefresh(req.userId)//создаем токен для Cookies

        const addRefreshTokenToDB = await JwtService.addTokenInDB(tokenRefresh)//добавляем cookies Token в DB
        if (!addRefreshTokenToDB) {
            return res.status(500).send({message: {error: "Failed to add a token to the database"}})
        }


        res.cookie('refreshToken', tokenRefresh, {httpOnly: true, secure: true})//передаем в cookie token
        return res.status(200).send({
            "accessToken": accessToken
        })

    })

    //регистрация и подтверждение
    .post('/registration-confirmation', authCodeValidation, errorsValidation, async (req: Request, res: Response) => {
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
        return res.status(204).json({
            user,
            message: 'Input data is accepted. Email with confirmation code will be sent to the provided email address.'
        });

    })

    //повторная отправка email
    .post('/registration-email-resending', authEmailValidation, errorsValidation, async (req: Request, res: Response) => {
        const {email} = req.body
        console.log("EMAIL _______" + email)
        const result = await AuthService.confirmEmail(email)
        if (!result) {
            return res.sendStatus(500);
        }
        return res.status(204).send(result + " Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere")
    })

    //выход и отчистка TokenDB
    .post("/logout",authTokenLogoutMiddleware, async (req: Request, res: Response) => {

        return res.sendStatus(204);
    })

    .get('/me', authTokenMiddleware, async (req: Request, res: Response) => {
        if (!req.userId) return res.status(401).send('Unauthorized')
        const user = await UsersQueryRepository.findUserById(req.userId);
        if (!user.data || user.status === ResultStatus.Unauthorized) return res.sendStatus(401)

        return res.status(200).send(user.data);

    })