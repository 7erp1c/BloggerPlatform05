import {blogsView} from "../model/blogsType/blogsView";
import {blogCollection} from "../db/mongo-db";
import {getBlogsView} from "../model/blogsType/getBlogsView";



export const BlogsRepositories = {
//get(/)
    async findFullBlogs() {
        const blogs: blogsView[] = await blogCollection.find({}).toArray();
        return blogs.map(getBlogsView)
    },
//post(/)
    async createBlogs(newBlogs: blogsView): Promise<blogsView> {
        await blogCollection.insertOne(newBlogs)
        return newBlogs
    },
//get(/id)
    async findBlogsByID(id: string): Promise<blogsView|null> {
        return await blogCollection.findOne({id}, {projection: {_id: 0}})
    },
//put(/id)
    async updateBlogs(id:string, name: string, description: string, websiteUrl: string): Promise<boolean> {
        const result = await blogCollection
            .updateOne({id:id},{$set:{name:name,description:description,websiteUrl:websiteUrl}})
        return result.matchedCount === 1
    },
//delete(/id)
    async deleteBlogs(id: string):Promise<boolean> {
        const result = await blogCollection.deleteOne({id:id})
        return result.deletedCount === 1
    },



}


