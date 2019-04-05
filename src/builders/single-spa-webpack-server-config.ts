export class SingleSpaWepackServerConfig{
    constructor(devServer: any, publicPath?:string, contentBase?: string){
        this.devServer = devServer;
        this.publicPath = publicPath;
        this.contentBase = contentBase;
    }
    public devServer: any;
    public publicPath?: string;
    public contentBase?: string;
}