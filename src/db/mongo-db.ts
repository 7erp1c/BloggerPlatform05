
import {Collection, MongoClient} from "mongodb";
import dotenv from "dotenv";
import {blogsView} from "../model/blogsType/blogsView";
import {PostsView} from "../model/postsType/postsView";
import {UsersOutputType} from "../model/usersType/inputModelTypeUsers";

dotenv.config()

 const mongoURI = process.env.MONGO_URL || 'http://localhost:27017'
console.log(process.env.MONGO_URL)
if(!mongoURI){
    throw new Error("URL doesn\'t found")
}
export const client: MongoClient = new MongoClient(mongoURI)


export let db = client.db();
export const blogCollection: Collection<blogsView> = db.collection<blogsView>("blogs")
export const postCollection: Collection<PostsView> = db.collection<PostsView>("posts")
export const usersCollection: Collection<UsersOutputType> = db.collection<UsersOutputType>("posts")

export const connectToDB = async () => {
    try {
        await client.connect()
        console.log('connected to db')
        return true
    } catch (e) {
        console.log(e)
        await client.close()
        return false
    }
}


