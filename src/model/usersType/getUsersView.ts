import {createUserAccountThroughAuth, UsersInputType} from "./inputModelTypeUsers";


export const getUsersView = (dbUsers: createUserAccountThroughAuth): UsersInputType => {
    return {
        id: dbUsers.id,
        login: dbUsers.accountDate.login,
        email: dbUsers.accountDate.email,
        createdAt: dbUsers.accountDate.createdAt,


    }
}
