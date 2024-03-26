import {Request,Response,Router} from "express";
import {UsersService} from "../domain/users-service";
import {authView} from "../model/authType/authType";
import {RequestWithUsers} from "../typeForReqRes/helperTypeForReq";
import {authValidation} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";



export const authRouter = Router({})

authRouter.post('/', async (req:RequestWithUsers<authView>,res:Response)=>{
    const { loginOrEmail, password } = req.body;
    const checkResult = await UsersService.checkCredentials(loginOrEmail,password)
    if (!loginOrEmail || !password) {
        return res.status(401).json({ error: 'Missing loginOrEmail or password' });
    }
    return res.status(204).send(checkResult)
})