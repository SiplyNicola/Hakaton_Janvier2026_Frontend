export interface NoteCreateCommand {
    title: string;
    owner_id: string;
    content_markdown?: string;
    folder_id?: string;
    size_bytes: number;
    line_count: number;
    word_count: number;
    char_count: number;
}