import {UsersInputType} from "./inputModelTypeUsers";


export const getUsersView = (dbUsers: UsersInputType): UsersInputType => {
    return {
        id: dbUsers.id,
        login: dbUsers.login,
        email: dbUsers.email,
        password: dbUsers.password,
        createdAt: dbUsers.createdAt,


    }
}