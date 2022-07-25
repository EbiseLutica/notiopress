/** 設定ファイルの型定義 */
export interface Settings {
    sites: SiteDefinition;
}

/** サイト定義 */
export interface SiteDefinition {
    /** ホスト */
    host: string;
    /** true であれば、本サイトをデフォルトとする */
    default: boolean;
    /** CSS ファイルパス */
    customCss?: string;
    /** サイト設定 */
    meta: {
        /** サイト タイトル */
        title: string;
        /** サイト サブタイトル */
        subTitle?: string;
    };
    /** Notion 設定 */
    notion: {
        /** Notion API トークン */
        token: string;
        /** データベース ID */
        databaseId: string;
    };
}
