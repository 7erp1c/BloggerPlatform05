;
import {usersCollection} from "../db/mongo-db";

export const AuthUsersRepository = {

    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },
}