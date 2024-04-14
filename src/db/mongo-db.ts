
import {Collection, MongoClient} from "mongodb";
import dotenv from "dotenv";
import {blogsView} from "../model/blogsType/blogsView";
import {PostsView} from "../model/postsType/postsView";
import {CommentView} from "../model/commentsType/commentsView";
import {createUserAccountThroughAuth} from "../model/usersType/inputModelTypeUsers";
import {OldTokenDB} from "../model/authType/authType";


dotenv.config()

 const mongoURI = process.env.MONGO_URL || 'http://localhost:27017'
console.log(process.env.MONGO_URL)
if(!mongoURI){
    throw new Error("URL doesn\'t found")
}
export const client: MongoClient = new MongoClient(mongoURI)


export let db = client.db("db");
export const blogCollection: Collection<blogsView> = db.collection<blogsView>("blogs")
export const postCollection: Collection<PostsView> = db.collection<PostsView>("posts")
export const usersCollection: Collection<createUserAccountThroughAuth> = db.collection<createUserAccountThroughAuth>("users")
export const commentsCollection: Collection<CommentView> = db.collection<CommentView>("comments")
export  const refreshTokenCollection:Collection<OldTokenDB> = db.collection<OldTokenDB>("old-old-token")
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


