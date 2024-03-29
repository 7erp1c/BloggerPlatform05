export type UserViewModelType={
    pagesCount : number
    page : number
    pageSize : number
    totalCount : number
    items :UsersInputType[]
}

export type UsersInputType = {
    id: string,
    login:string,
    email:string,
    password?:string|undefined,
    createdAt?:string,
}

export type UsersOutputType = {
    id:string;
    login:string;
    email:string;
    createdAt:string;
    passwordSalt: string;
    passwordHash: string;
}

export type QueryUserRequestType = {
    searchLoginTerm?: string | null,
    searchEmailTerm?: string | null,
    sortBy?: string,
    sortDirection?: "asc" | "desc",
    pageNumber?: number,
    pageSize?: number,
}

export type SortUsersRepositoryType = {
    sortBy: string,
    sortDirection: "asc" | "desc",
    pageNumber: number,
    pageSize: number
}
export type SearchUsersLoginRepositoryType = {
    searchLoginTerm: string | null
}
export type SearchUsersEmailRepositoryType = {
    searchEmailTerm: string | null
}