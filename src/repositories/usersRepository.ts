import {usersCollection} from "../db/mongo-db";
import {UsersInputType, UsersOutputType} from "../model/usersType/inputModelTypeUsers";
import {convertToGetAuthType} from "../model/authType/getAuthView";



export const UsersRepository = {
//post(/)
    async createUser(newUser: UsersOutputType): Promise<UsersInputType> {
        await usersCollection.insertOne(newUser)
        console.log(newUser)
        return newUser
    },
    async findByLoginOrEmail(loginOrEmail:string){
        return await usersCollection
            .findOne({$or:[{email:loginOrEmail},{login:loginOrEmail}]})

    },
    //delete(/id)
    async deleteUser(id: string):Promise<boolean> {
        const result = await usersCollection.deleteOne({id:id})
        return result.deletedCount === 1
    },
    async findUserById(id:string){
        return await usersCollection.findOne({id}, {projection: {_id: 0}})
    },


}