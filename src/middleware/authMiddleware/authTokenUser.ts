import {Request, Response, NextFunction} from "express";
import {JwtService} from "../../application/jwt-service";
import {Result} from "../../model/result.type";





export const authTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.sendStatus(401)
        return
    }
    const token = req.headers.authorization?.split(' ')[1]// "bearer dgsdsdddgsdgddsgdgsdgdgsdgsdgsgdgsd"

    const userId = await JwtService.getIdFromToken(token)
    // console.log("userId: "+ userId)
    if (userId) {
        req.userId = userId
        //req.user = await UsersService.findUserById(userId)
        // console.log("user: "+ req.user)
      return  next()
    }
  return  res.send(401)

}
