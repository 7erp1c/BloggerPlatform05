
import {PostsView} from "../model/postsType/postsView";
import {db} from "../db/db";


export const PostsRepositories = {
    //get(/)
    async findFullPosts():Promise<PostsView[]> {
        return db.getCollections().postCollection.find({},{ projection: { _id: 0 }}).toArray()
    },
//post(/)

    async createPosts(newPosts:PostsView):Promise<PostsView> {
        await db.getCollections().postCollection.insertOne(newPosts)
        return newPosts

    },
//get(/id)
    async  findPostsByID(id: string):Promise<PostsView|null> {
        return  await db.getCollections().postCollection.findOne({id}, { projection: { _id: 0 }});

    },
//put(/id)
    async updatePosts(id: string, title: string, shortDescription: string, content: string, blogId:string):Promise<boolean> {
        const result = await db.getCollections().postCollection
            .updateOne({id:id},{$set:{title:title,shortDescription:shortDescription,content:content,blogId:blogId}})
        return result.matchedCount === 1

    },
//delete(/id)
    async deletePosts(id: string): Promise<boolean> {
        const result = await db.getCollections().postCollection.deleteOne({id:id})
        return result.deletedCount === 1
    }
}