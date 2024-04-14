import {ResultStatus} from "../_util/enum";

export type Result<T = null> = {
    status: ResultStatus
    errorMessage?: string
    extensions?: [{ field: 'id', message: '' }]
    data: T
}