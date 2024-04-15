import {db} from "../db/db";


export const AuthUsersRepository = {

    async deleteUser(id: string): Promise<boolean> {
        const result = await db.getCollections().usersCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },
}