import {NextFunction, Request, Response} from "express";
import {RefreshTokenRepository} from "../../repositories/old-token/refreshTokenRepository";
import {JwtService} from "../../application/jwt-service";
import {UsersQueryRepository} from "../../repositoriesQuery/user-query-repository";
import {ResultStatus} from "../../_util/enum";


export const authRefreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
    if (!user||!user.data) {
        return res.status(401).send('Unauthorized 2');
    }

    if(user){
        req.userId = userId
        //req.user = await UsersService.findUserById(userId)
        // console.log("user: "+ req.user)
        return  next()
    }

}