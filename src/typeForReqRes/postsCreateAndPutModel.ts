export type postsCreateAndPutModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName:string

}

export type postCreateForBlog = {
    blogId: string
}