import {ObjectId} from "mongodb";

export type CommentView = {

    id: string,
    content: string,
    commentatorInfo: {
        userId: string | undefined,
        userLogin: string | undefined
    },
    createdAt: string,
    postId: string

}
export type CommentViewOutput ={
    id: string,
    content: string,
    commentatorInfo: {
        userId: string | undefined,
        userLogin: string | undefined
    },
    createdAt: string
}