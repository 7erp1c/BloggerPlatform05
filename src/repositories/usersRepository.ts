import {usersCollection} from "../db/mongo-db";
import {createUserAccountThroughAuth} from "../model/usersType/inputModelTypeUsers";




export const UsersRepository = {
//post(/)
    async createUser(newUser: createUserAccountThroughAuth): Promise<createUserAccountThroughAuth> {
        await usersCollection.insertOne(newUser)
        console.log(newUser)
        return newUser
    },

    async findByLoginOrEmail(loginOrEmail: string) {

        return await usersCollection
            .findOne({$or: [{"emailConfirmation.email": loginOrEmail}, {"emailConfirmation.login": loginOrEmail}]})

    },
    //delete(/id)
    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },
    async findUserById(id: string) {
        return await usersCollection.findOne({id}, {projection: {_id: 0}})
    },


}