import {ObjectId} from "mongodb";
import {JwtService} from "../../application/jwt-service";
import {UsersService} from "../users-service";
import {CommentsRepositories} from "../../repositories/comments/commentsRepository";
import {CommentViewOutput} from "../../model/commentsType/commentsView";
import {PostsRepositories} from "../../repositories/postsRepositories";

export const CommentsService = {
    async createComments(content: string, foundPostId: string, token: string): Promise<CommentViewOutput> {
        const userId = await JwtService.getUserIdByToken(token);
        const id = userId ? userId.toHexString() : null;
        const user = await UsersService.findUserById(id)

        let newComment = {
            id: new ObjectId().toString(),
            content: content,
            commentatorInfo: {
                userId: user?.id,
                userLogin: user?.accountDate.login
            },
            createdAt: new Date().toISOString(),
            postId: foundPostId

        }
        const createdComment = await CommentsRepositories.createComments(newComment)
        return {
            id: createdComment.id,
            content: createdComment.content,
            commentatorInfo: {
                userId: createdComment.commentatorInfo.userId,
                userLogin: createdComment.commentatorInfo.userLogin
            },
            createdAt: createdComment.createdAt
        }
    },

    async allComments(id: string) {
        return await CommentsRepositories.allComments(id);
    },

    async deleteComments(id:string){
        return await CommentsRepositories.deleteComments(id);
    },

    async updateComment(commentId:string,content:string){
        return await CommentsRepositories.updateComment(commentId,content)
    }

}