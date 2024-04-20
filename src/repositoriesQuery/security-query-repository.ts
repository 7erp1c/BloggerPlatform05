import {connectMongoDb} from "../db/connect-mongo-db";
import {getSecuritySessions} from "../model/authType/authType";
import {getSessionsView} from "../model/authType/authSecurityView";

export const SecurityQueryRepository = {
    async findAllSessions(): Promise<getSecuritySessions[]> {
        const result = await connectMongoDb
            .getCollections().securityCollection.find({}, {projection: {_id: 0}}).toArray()
        return result.map(getSessionsView)
    },
    async findSessionByDeviceId(deviceId:string){
    const result = await connectMongoDb
        .getCollections().securityCollection.findOne({deviceId:deviceId}, {projection: {_id: 0}})
    if(!result)return null
        return result.userId
}

}