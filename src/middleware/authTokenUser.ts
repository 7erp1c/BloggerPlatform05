import {Request, Response, NextFunction} from "express";
import {JwtService} from "../application/jwt-service";
import {UsersService} from "../domain/users-service";


export const authTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(401)
        return
    }
    const token = req.headers.authorization.split(' ')[1]// "bearer dgsdsdddgsdgddsgdgsdgdgsdgsdgsgdgsd"

    const userId = await JwtService.getUserIdByToken(token)
    if (userId) {
        req.user = await UsersService.findUserById(userId)
      return  next()
    }
  return  res.send(401)

}
