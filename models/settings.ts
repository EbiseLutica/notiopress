/** 設定ファイルの型定義 */
export interface Settings {
    /** サイト一覧 */
    sites: SiteDefinition[];
    /** Notion API トークン */
    notionToken: string;
}

/** サイト定義 */
export interface SiteDefinition {
    /** ホスト */
    host: string;
    /** true であれば、本サイトをデフォルトとする */
    default: boolean;
    /** CSS ファイルパス */
    customCss?: string;
    /** サイト タイトル */
    title: string;
    /** サイト サブタイトル */
    subTitle?: string;
    /** サイト 著作権表示 */
    copyright?: string;
    /** データベース ID */
    databaseId: string;
}
