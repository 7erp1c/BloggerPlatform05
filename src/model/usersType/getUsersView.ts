import {createUserAccountThroughAuth, UsersInputType} from "./inputModelTypeUsers";
import { getAuthTypeEndpointMe} from "../authType/authType";


export const getUsersView = (dbUsers: createUserAccountThroughAuth): UsersInputType => {
    return {
        id: dbUsers.id,
        login: dbUsers.accountData.login,
        email: dbUsers.accountData.email,
        createdAt: dbUsers.accountData.createdAt,


    }
}
export const getAuthUsersView = (dbAuthUsers: createUserAccountThroughAuth): getAuthTypeEndpointMe => {
    return {
        email: dbAuthUsers.accountData.email,
        login: dbAuthUsers.accountData.login,
        userId: dbAuthUsers.id,
    }
}
