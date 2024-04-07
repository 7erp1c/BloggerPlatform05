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
            .findOne({$or: [{"accountData.email": loginOrEmail}, {"accountData.login": loginOrEmail}]})

    },
    async findUserByEmail(email: string) {
        return await usersCollection.findOne({"accountData.email": email})
    },
    async findUserByCode(code: string) {
        return await usersCollection.findOne({"emailConfirmation.confirmationCode": code})
    },
    async findUserByLogin(login: string) {
        return await usersCollection.findOne({"accountData.login": login})
    },
    //delete(/id)
    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },

    async updateConfirmation(id: string) {
        let result = await usersCollection
            .updateOne({id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    },
    async updateUserEmailConfirmationCode(email: string, code: string,data:string) {
        console.log("updateUserEmailConfirmationCode: " + email + " " + code)

        // try {
        const isUpdated = await usersCollection.updateOne({"accountData.email": email}, {$set: {"emailConfirmation.confirmationCode": code,"emailConfirmation.expirationDate":data}});
        return isUpdated.matchedCount === 1;
        // }catch (err){
        //     return new Error("Not update confirmationCode")
        // }
    }


}