export interface PostMetadata {
    title: string;
    images?: string[];
    tags: PostTag[];
}

export type PostTag =
    | "personal"
    | "featured"
    | "academic"
    | "hidden";