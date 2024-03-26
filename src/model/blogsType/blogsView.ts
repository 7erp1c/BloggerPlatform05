export type BlogViewModelType={
    pagesCount : number
    page : number
    pageSize : number
    totalCount : number
    items :blogsView[]
}

export type blogsView = {
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
    _id?: string;
}
export type QueryBlogRequestType = {
    searchNameTerm?: string | null
    sortBy?: string
    sortDirection?: "asc" | "desc"
    pageNumber?: number
    pageSize?: number
}
export type SortBlogRepositoryType = {
    sortBy: string
    sortDirection: "asc" | "desc"
    pageNumber: number
    pageSize: number
}
export type SearchBlogRepositoryType = {
    searchNameTerm: string | null
}
export type BlogType ={
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}