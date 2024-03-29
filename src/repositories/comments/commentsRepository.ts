import {CommentView} from "../../model/commentsType/commentsView";
import {commentsCollection} from "../../db/mongo-db";

export const CommentsRepositories = {
    async createComments(newComment: CommentView): Promise<CommentView> {
        await commentsCollection.insertOne(newComment)
        return newComment

    }
}