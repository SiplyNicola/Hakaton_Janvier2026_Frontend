export interface Notes {
    id?: number;
    owner_id: number;
    folder_id?: number;
    title: string;
    content_markdown?: string;
    created_at?: Date;
    updated_at?: Date;
    size_bytes: number;
    line_count: number;
    word_count: number;
    char_count: number;
}