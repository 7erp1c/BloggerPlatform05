import {Request,Response,Router} from "express";
import {UsersService} from "../domain/users-service";
import {authView, getAuthType} from "../model/authType/authType";
import {RequestWithUsers} from "../typeForReqRes/helperTypeForReq";
import {JwtService} from "../application/jwt-service";
import {authTokenMiddleware} from "../middleware/authTokenUser";


export const authRouter = Router({})

authRouter.post('/login', async (req:RequestWithUsers<authView>,res:Response)=>{
    const { loginOrEmail, password } = req.body;
    if (!loginOrEmail || !password) {
       return  res.status(401)
    }
    const user = await UsersService.checkCredentials(loginOrEmail,password)

    if (!user) {
        return  res.status(401)
    }

    const token = await JwtService.createJWT(user)
    return  res.status(200).send({
        "accessToken": token
    })

})
authRouter.get('/me', authTokenMiddleware, async(req:Request,res:Response)=>{

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

        const responseData: getAuthType  = {
            email: user.email,
            login: user.login,
            userId: user.id
        }
         return res.status(200).send(responseData);

})