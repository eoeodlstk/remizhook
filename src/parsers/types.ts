/**
 * Represents the configuration block for a specific scraping target.
 */
export interface SiteConfig {
    name: string;
    url: string;
    selector: string;
    typeFilter?: string[];
    iconURL?: string;
    dataKey: string;
    encoding?: string;          // 사이트 인코딩 (기본값: UTF-8, 뽐뿌: EUC-KR)
    useFlaresolverr?: boolean;  // Cloudflare 차단 사이트용 FlareSolverr 사용 여부
}

/**
 * Represents the standardized output of a parsed item.
 */
export interface ItemData {
    id: number;
    type: string;
    name: string;
    url: string;
    thumbnail: string;
    date: string;
}

/**
 * Every parser module must implement this interface.
 */
export interface SiteParser {
    extract($: any, element: any, site: SiteConfig, todayDate: string): ItemData | undefined;
}
