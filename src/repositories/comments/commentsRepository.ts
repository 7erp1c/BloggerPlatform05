import {CommentView} from "../../model/commentsType/commentsView";
import {db} from "../../db/db";

export const CommentsRepositories = {
    async createComments(newComment: CommentView): Promise<CommentView> {
        await db.getCollections().commentsCollection.insertOne(newComment)
        return newComment
    },
    async allComments(id:string){
        return await db.getCollections().commentsCollection.findOne({id}, {projection: {_id: 0, postId: 0}})
    },
    async deleteComments(id: string): Promise<boolean> {
        const result = await db.getCollections().commentsCollection.deleteOne({id:id})
        return result.deletedCount === 1
    },
    async updateComment(id:string,content:string): Promise<boolean>{
        const result = await db.getCollections().commentsCollection
            .updateOne({id:id},{$set:{content:content}})
        return result.matchedCount === 1
    }

}