export interface Notes {
    id?: number;
    owner_id: number;
    title: string;
    content_markdown?: string;
    createdAt?: Date;
    updatedAt?: Date;
    size_bytes: number;
    line_count: number;
    word_count: number;
    char_count: number;
}