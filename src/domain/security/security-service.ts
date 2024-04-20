import {JwtService} from "../../application/jwt-service";
import {SessionsAddDB, RefreshTokenPayloadType} from "../../model/authType/authType";
import {securityRepository} from "../../repositories/api/securityRepository";
import {UsersRepository} from "../../repositories/usersRepository";
import {connectMongoDb} from "../../db/connect-mongo-db";

export const SecurityService = {
    async createAuthSession(refreshToken: string, deviceTitle: string, ip: string) {
        const decodedToken = await JwtService.decodeRefreshToken(refreshToken);

        if (!decodedToken) return null;

        const newSession: SessionsAddDB = {
            userId: decodedToken.userId,
            deviceId: decodedToken.deviceId,
            deviceTitle: deviceTitle,
            ip: ip,
            lastActiveDate: decodedToken.iat,
            refreshToken: {
                createdAt: decodedToken.iat,
                expiredAt: decodedToken.exp,
            }
        };
        await securityRepository.createNewSession(newSession);
        return true;
    },
    async deleteDevicesSessions() {
        await securityRepository.deleteDevicesSessions()
        const checkDb = await connectMongoDb.getCollections().securityCollection.countDocuments()
        return checkDb < 1;

    },
    async deleteDevicesSessionsById(id:string): Promise<boolean> {
        return await securityRepository.deleteDevicesSessionsById(id)
    }

}