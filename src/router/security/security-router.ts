import {Request, Response, Router} from "express";
import {SecurityService} from "../../domain/security/security-service";
import {RequestWithDelete} from "../../typeForReqRes/helperTypeForReq";
import {_delete_all_} from "../../typeForReqRes/blogsCreateAndPutModel";
import {SecurityQueryRepository} from "../../repositoriesQuery/security-query-repository";
import {authTokenMiddleware} from "../../middleware/authMiddleware/authTokenUser";


export const securityRouter = Router({})

    .get("/devices",authTokenMiddleware, async (req: Request, res: Response) => {
const devices = await SecurityQueryRepository.findAllSessions()
        return res.status(200).send({devices})
    })
    .delete("/devices", authTokenMiddleware, async (req: Request, res: Response) => {
        const result = await SecurityService.deleteDevicesSessions()
        if(!result){
            res.sendStatus(401)
        }
        res.sendStatus(204)
    })
    .delete("/devices/:deviceId", authTokenMiddleware,async (req: RequestWithDelete<_delete_all_>, res: Response) => {
        const result = await SecurityService.deleteDevicesSessionsById(req.params.id)
        if (!result) {
            res.sendStatus(404);
            return
        }
        res.sendStatus(204);
    })