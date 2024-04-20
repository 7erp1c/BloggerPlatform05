import {connectMongoDb} from "../../db/connect-mongo-db";
import {SessionsAddDB} from "../../model/authType/authType";

export const securityRepository = {

    async saveRequestInformation(ip: string, url: string) {
        const result = await connectMongoDb.getCollections().apiLogCollection.insertOne({
            IP: ip,
            URL: url,
            date: new Date()
        });
    },
    async countRequestByTime(ip: string, url: string, interval: number) {

        const timeCheck = (new Date(Date.now() - (1000 * interval)));

        const searchKey = {

                IP: ip,
                URL: url,
                date: {$gte: timeCheck}

        };
        return await connectMongoDb.getCollections().apiLogCollection.countDocuments(searchKey);
    },
    //закидываем сессию в db
    async createNewSession(newSession:SessionsAddDB){
        await connectMongoDb.getCollections().securityCollection.insertOne(newSession)
    },
    //удаляем все
    async deleteDevicesSessions() {
         await connectMongoDb.getCollections().securityCollection.deleteMany({})
    },
    //удаляем по deviceId
    async deleteDevicesSessionsById(id: string): Promise<boolean> {
        const result = await connectMongoDb.getCollections().securityCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },




}