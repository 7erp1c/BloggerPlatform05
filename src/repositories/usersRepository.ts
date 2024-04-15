
import {createUserAccountThroughAuth} from "../model/usersType/inputModelTypeUsers";
import {db} from "../db/db";


export const UsersRepository = {
//post(/)
    async createUser(newUser: createUserAccountThroughAuth): Promise<createUserAccountThroughAuth> {
        await db.getCollections().usersCollection.insertOne(newUser)
        console.log(newUser)
        return newUser
    },

    async findByLoginOrEmail(loginOrEmail: string) {
        return await db.getCollections().usersCollection
            .findOne({$or: [{"accountData.email": loginOrEmail}, {"accountData.login": loginOrEmail}]})

    },
    async findUserByCode(code: string) {
        return await db.getCollections().usersCollection.findOne({"emailConfirmation.confirmationCode": code})
    },
    async findUserByLogin(login: string) {
        return await db.getCollections().usersCollection.findOne({"accountData.login": login})
    },
    //delete(/id)
    async deleteUser(id: string): Promise<boolean> {
        const result = await db.getCollections().usersCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },

    async updateConfirmation(id: string) {
        let result = await db.getCollections().usersCollection
            .updateOne({id}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.modifiedCount === 1
    },
    async updateUserEmailConfirmationCode(email: string, code: string,data:string) {
        console.log("updateUserEmailConfirmationCode: " + email + " " + code)

        // try {
        const isUpdated = await db.getCollections().usersCollection.updateOne({"accountData.email": email}, {$set: {"emailConfirmation.confirmationCode": code,"emailConfirmation.expirationDate":data}});
        return isUpdated.matchedCount === 1;
        // }catch (err){
        //     return new Error("Not update confirmationCode")
        // }
    }


}