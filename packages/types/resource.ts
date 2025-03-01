export interface MockResource {
    id: string;
    title: string;
    sections: Section[];
}
export interface Section {
    header: string;
    content: string;
}