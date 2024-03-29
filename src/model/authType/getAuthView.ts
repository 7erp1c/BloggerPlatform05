import {UsersInputType} from "../usersType/inputModelTypeUsers";
import {getAuthType} from "./authType";

export const convertToGetAuthType = (userAuth: UsersInputType): getAuthType => {
    return {
        email: userAuth.email,
        login: userAuth.login,
        userId: userAuth.id
    };
};


