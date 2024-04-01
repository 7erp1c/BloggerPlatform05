import {createUserAccountThroughAuth, UsersInputType} from "./inputModelTypeUsers";


export const getUsersView = (dbUsers: createUserAccountThroughAuth): UsersInputType => {
    return {
        id: dbUsers.id,
        login: dbUsers.accountData.login,
        email: dbUsers.accountData.email,
        createdAt: dbUsers.accountData.createdAt,


    }
}
