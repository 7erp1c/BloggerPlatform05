import {Request, Response, NextFunction} from "express";
import {JwtService} from "../../application/jwt-service";
import {Result} from "../../model/result.type";
import {SecurityQueryRepository} from "../../repositoriesQuery/security-query-repository";


export const authTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) return res.sendStatus(401)          //_____
    //derbanim token
    const token = req.headers.authorization?.split(' ')[1]// "bearer dgsdsdddgsdgddsgdgsdgdgsdgsdgsgdgsd"
    //getting the id from the token
    const userId = await JwtService.getIdFromToken(token)
    //getting the id from the sessions
    const findUserIdAndDeviceId = await SecurityQueryRepository.findSessionByDeviceId(req.params.id)
    // If try to delete the deviceId of other user
    if (userId != findUserIdAndDeviceId) return res.sendStatus(403)     //_____

    if (userId) {
        req.userId = userId
        return next()
    }
    // If the JWT refreshToken inside cookie is missing, expired or incorrect
    return res.send(401)                                                //_____

}