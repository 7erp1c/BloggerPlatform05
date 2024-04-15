import {NextFunction, Request, Response} from "express";
import {JwtService} from "../../application/jwt-service";
import {RefreshTokenRepository} from "../../repositories/old-token/refreshTokenRepository";
import {connectMongoDb} from "../../db/connect-mongo-db";


export const authTokenLogoutMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const {refreshToken} = req.cookies
    if (!refreshToken) {
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
    if (!refreshTokenStatusValid) {
        return res.status(401).send('the token is invalid')
    }
    //чистим DB токенов
    await connectMongoDb.getCollections().refreshTokenCollection.deleteMany({})

    if (refreshTokenStatusValid) {
        return next()
    }

}
