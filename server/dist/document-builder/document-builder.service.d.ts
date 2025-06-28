export declare class DocumentBuilderService {
    getDataByProp(prop: string): any;
    getAllData(): any;
    checkFileExists(fileName: string): boolean;
    readJsonFile(fileName: string): any;
    writeJsonFile(fileName: string, data: any): boolean;
    createCacheDocument(embeddings: any): boolean;
    checkCacheDocument(): boolean;
    getCacheDocument(): any;
}
