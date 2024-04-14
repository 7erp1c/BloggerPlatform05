import {Request, Response, Router} from "express";
import {UsersService} from "../domain/users-service";
import { authView, getAuthType} from "../model/authType/authType";
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
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";
import {UsersQueryRepository} from "../repositoriesQuery/user-query-repository";
import {refreshTokenCollection} from "../db/mongo-db";
import {CommentsService} from "../domain/comments/comments-service";
import {ResultStatus} from "../_util/enum";
import {createUserAccountThroughAuth} from "../model/usersType/inputModelTypeUsers";
import {Result} from "../model/result.type";


export const authRouter = Router({})
authRouter
    .post('/login', authValidation, errorsValidation, async (req: RequestWithUsers<authView>, res: Response) => {
         const {loginOrEmail, password} = req.body;

        const user = await UsersService.checkCredentials(loginOrEmail, password)//находим user
        if (!user.data|| user.status === ResultStatus.Unauthorized) return res.sendStatus(401)

        const token     = await JwtService.createJWT(user.data)// создаем токен для Authorisation
        const tokenRefresh = await JwtService.createJWTRefresh(user.data)//создаем токен для Cookies
        //
        const allUpdateOldRefreshJWT = await JwtService.updateDBJWT();
        const addRefreshTokenToDB = await JwtService.addTokenInDB(tokenRefresh)//добавляем cookies Token в DB


        res.cookie('refreshToken', tokenRefresh, {httpOnly: true, secure: true})//передаем в cookie token
        return res.status(200).send({
            "accessToken": token
        })

    })

    .post('/refresh-token',async(req:Request,res: Response)=>{
        const {refreshToken} = req.cookies
        if(!refreshToken) {
            return res.status(401).send('JWT refreshToken has expired 1')
        }

        const refreshTokenStatusValidBeginning = await RefreshTokenRepository.invalidateToken(refreshToken)
        if(!refreshTokenStatusValidBeginning){
            return res.status(401).send('the token is invalid 1')
        }
        //проверяем токен протух, id и т.д.
        const userId = await JwtService.getIdFromToken(refreshToken)//проверяем токен
        if (!userId) {
            const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refreshToken)
            return res.status(401).send('Unauthorized 1');
        }

       // Обновляем статус валидности актуального refresh token
        const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refreshToken)
        if(!upTokenValid){
            return res.status(401).send('the token not update valid')
        }

        //проверка Инвалидация предыдущего refresh token
        const refreshTokenStatusValid = await RefreshTokenRepository.invalidateToken(refreshToken)
        if(refreshTokenStatusValid){
            const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refreshToken)
            return res.status(401).send('The token is no longer valid')
        }
        //Находим user по id из refreshToken:
        const user = await UsersQueryRepository.findUserById(userId);
        if (!user) {
            return res.status(401).send('Unauthorized 2');
        }


       // res.clearCookie('refreshToken');
        const  accessToken = await JwtService.createJWT(user)// создаем токен для Authorisation
        const tokenRefresh = await JwtService.createJWTRefresh(user)//создаем токен для Cookies

        const addRefreshTokenToDB = await JwtService.addTokenInDB(tokenRefresh)//добавляем cookies Token в DB
        if(!addRefreshTokenToDB){
            return res.status(500).send({message: {error:"Failed to add a token to the database"}})
        }


        res.cookie('refreshToken', tokenRefresh, {httpOnly: true, secure: true})//передаем в cookie token
        return res.status(200).send({
            "accessToken": accessToken
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

        const result = await AuthService.confirmEmail(email)
        if (!result) {
            return res.sendStatus(500);
        }
        return res.status(204).send(result + " Input data is accepted. Email with confirmation code will be send to passed email address. Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere")
    })
    //выход и отчистка TokenDB
    .post("/logout",async(req:Request,res:Response)=>{
        const {refreshToken} = req.cookies
        if (!refreshToken) {//если пустой token
            return res.status(401).send('JWT refreshToken is missing');
        }
        const findRefreshToken = await RefreshTokenRepository.checkToken(refreshToken)
        if (!findRefreshToken) {//если  token не найден в DB
            return res.status(401).send('JWT refreshToken is missing 2');
        }
        //проверяем токен протух, id и т.д.
        const userId = await JwtService.getIdFromToken(refreshToken)//проверяем токен
        if (!userId) {
            const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refreshToken)
            return res.status(401).send('Unauthorized 1');
        }
        //проверяем статус в DB
        const refreshTokenStatusValid = await RefreshTokenRepository.invalidateToken(refreshToken)
        if(!refreshTokenStatusValid){
            return res.status(401).send('the token is invalid')
        }

        const allDelete = await refreshTokenCollection.deleteMany({})
        return res.sendStatus(204);
    })

    .get('/me', authTokenMiddleware, async (req: Request, res: Response) => {

        if (!req.headers.authorization) {
            return res.status(401).send('Unauthorized 1');
        }
        const token = req.headers.authorization?.split(' ')[1];


        const userId = await JwtService.getIdFromToken(token);
        if (!userId) {
            return res.status(401).send('Unauthorized 2');
        }

        const user = await UsersQueryRepository.findUserById(userId);
        if (!user) {
            return res.status(401).send('Unauthorized 3');
        }

        const responseData: getAuthType = {
            email: user.accountData.email,
            login: user.accountData.login,
            userId: user.id
        }
        return res.status(200).send(responseData);

    })