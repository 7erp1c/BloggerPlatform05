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
import jwt from "jsonwebtoken";
import {settings} from "../setting";
import {RefreshTokenRepository} from "../repositories/old-token/refreshTokenRepository";


export const authRouter = Router({})
authRouter
    .post('/login', authValidation, errorsValidation, async (req: RequestWithUsers<authView>, res: Response) => {
        const {loginOrEmail, password} = req.body;
        if (!loginOrEmail || !password) {
            return res.sendStatus(401)
        }
        const user = await UsersService.checkCredentials(loginOrEmail, password)//находим user
        if (!user) {
            return res.sendStatus(401)
        }

        const token = await JwtService.createJWT(user)// создаем токен для Authorisation
        const tokenRefresh = await JwtService.createJWT(user)//создаем токен для Cookies

        const addRefreshTokenToDB = await JwtService.addTokenInDB(tokenRefresh)//добавляем cookies Token в DB
        if(!addRefreshTokenToDB){
            return res.status(400).send({message: {error:"func addRefreshTokenToDB did not add a token to the database"}})
        }

        res.cookie('refreshToken', tokenRefresh, {httpOnly: true, secure: true})//передаем в cookie token
        return res.status(200).send({
            "accessToken": token
        })

    })

    .post('/refresh-token',async(req:Request,res: Response)=>{
        const {refresh_token} = req.cookies
        console.log(refresh_token)
        if(!refresh_token) {
            return res.status(401).send('JWT refreshToken has expired 1')
        }
        //const token = refresh_token?.split(' ')[1];
        //Протух?
        const decodedToken =   jwt.verify(refresh_token, settings.JWT_SECRET);
        if (typeof decodedToken !== "string"){//проверка истек token или нет
            const decodedJwtPayload = decodedToken as { exp: number }
            const expiryTimestamp = decodedJwtPayload.exp * 1000;// Преобразуем время истечения в миллисекунды
            if (Date.now() >= expiryTimestamp) {
                // refreshToken истек, возвращаем ошибку 401
                return true //res.status(401).send('JWT refreshToken has expired');
            }
            return res.status(401).send('JWT refreshToken has expired 2');
        }
        //Достает id из refreshToken:
        const userId = await JwtService.getIdFromToken(refresh_token)//достаём id из token
        const id = userId ? userId.toHexString() : null;
        if (!id) {
            return res.status(401).send('Unauthorized 1');
        }
        //Находим user по id из refreshToken:
        const user = await UsersService.findUserById(id);
        if (!user) {
            return res.status(401).send('Unauthorized 2');
        }
        //update OldRefreshToken
        const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refresh_token)
        if(!upTokenValid){
            res.status(401).send('the token is valid')
        }
        res.clearCookie('refreshToken');
        const  accessToken = await JwtService.createJWT(user)// создаем токен для Authorisation
        const tokenRefresh = await JwtService.createJWT(user)//создаем токен для Cookies
        const addRefreshTokenToDB = await JwtService.addTokenInDB(tokenRefresh)//добавляем cookies Token в DB
        if(!addRefreshTokenToDB){
            return res.status(400).send({message: {error:"func addRefreshTokenToDB did not add a token to the database"}})
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
    //выход и отчистка TokenDB
    .post("/logout",async(req:Request,res:Response)=>{
        const {refresh_token} = req.cookies
        if (!refresh_token) {//если пустой token
            return res.status(401).send('JWT refreshToken is missing');
        }

        const findRefreshToken = await RefreshTokenRepository.checkToken(refresh_token)
        if (!findRefreshToken) {//если  token не найден в DB
            return res.status(401).send('JWT refreshToken is missing 2');
        }
        const decodedToken =  jwt.verify(refresh_token, settings.JWT_SECRET);
        if (typeof decodedToken !== "string"){//проверка истек token или нет
            const decodedJwtPayload = decodedToken as { exp: number }
            const expiryTimestamp = decodedJwtPayload.exp * 1000;// Преобразуем время истечения в миллисекунды
            if (Date.now() >= expiryTimestamp) {
                // refreshToken истек, возвращаем ошибку 401
                return true //res.status(401).send('JWT refreshToken has expired');
            }
            return res.status(401).send('JWT refreshToken has expired');
        }
        //update oldRefreshToken
        const upTokenValid = await RefreshTokenRepository.updateRefreshValid(refresh_token)
        if(!upTokenValid){
            res.status(401).send('the token is valid')
        }
        //
        const invalidateRefreshToken = await RefreshTokenRepository.invalidateToken(refresh_token);
         if (invalidateRefreshToken){
             return res.status(401).send("token is valid")
         }
        res.clearCookie('refreshToken');
        return res.sendStatus(204);
    })

    .get('/me', authTokenMiddleware, async (req: Request, res: Response) => {

        if (!req.headers.authorization) {
            return res.status(401).send('Unauthorized');
        }
        const token = req.headers.authorization?.split(' ')[1];

        const userId = await JwtService.getIdFromToken(token);

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