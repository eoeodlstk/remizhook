import Discord, { EmbedBuilder } from 'discord.js';
import dotenv from "dotenv";
import * as cheerio from 'cheerio';
import axios from 'axios';
const cloudscraper = require('cloudscraper');
import iconv from 'iconv-lite';
import cron from 'node-cron';
import { db, getLastId, setLastId } from './db';
import { getParser } from './parsers';
import { SiteConfig, ItemData } from './parsers/types';
import { today, isFiltered } from './utils';

//환경설정 파일 불러오기
dotenv.config();

// Initialize Discord Webhook Clients array conditionally
const hooks: Discord.WebhookClient[] = [];

if (process.env.DISCORDBOT && process.env.DISCORDTOKEN) {
    hooks.push(new Discord.WebhookClient({ id: process.env.DISCORDBOT, token: process.env.DISCORDTOKEN }));
}
if (process.env.DISCORDBOT2 && process.env.DISCORDTOKEN2) {
    hooks.push(new Discord.WebhookClient({ id: process.env.DISCORDBOT2, token: process.env.DISCORDTOKEN2 }));
}
if (hooks.length === 0) {
    console.warn("[WARNING] No valid Discord Webhook credentials found in `.env`! Embeds will not be sent.");
}

/*
    name: 사이트 이름
    url: 사이트 상점 주소,
    selector: 상점 게시판에서 줄단위로 되어 있는 상위태그 ,
    typeFilter: 불러올 타입들,
    iconURL: favicon.ico',
    dataKey: 저장 키 이름,
 */
const sitesHourly: SiteConfig[] = [
    {
        name: '뽐뿌',
        url: 'https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu',
        selector: 'tr[class^="baseList bbs_new1"]',
        typeFilter: ['[컴퓨터]', '[디지털]', '[가전/가구]'],
        iconURL: 'http://www.ppomppu.co.kr/favicon.ico',
        dataKey: 'ppomppu_computer',
        encoding: 'EUC-KR'
    },
    {
        name: '해외뽐뿌',
        url: 'https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu4',
        selector: 'tr[class^="baseList bbs_new1"]',
        iconURL: 'http://www.ppomppu.co.kr/favicon.ico',
        dataKey: 'foppomppu_computer',
        encoding: 'EUC-KR'
    },
    {
        name: '알리뽐뿌',
        url: 'https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu8',
        selector: 'tr[class^="baseList bbs_new1"]',
        iconURL: 'http://www.ppomppu.co.kr/favicon.ico',
        dataKey: 'foppomppu_digital',
        encoding: 'EUC-KR'
    },
    {
        name: '핫딜채널',
        url: 'https://arca.live/b/hotdeal',
        selector: 'div[class^="list-table hybrid"] > div[class^="vrow hybrid"]',
        typeFilter: ['전자제품', 'PC/하드웨어', 'SW/게임', '임박', '기타'],
        iconURL: 'https://arca.live/static/favicon.ico',
        dataKey: 'hotdeal_chanel',
        useFlaresolverr: true
    },
    {
        name: '루리웹',
        url: 'https://bbs.ruliweb.com/market/board/1020',
        selector: 'tr[class^="table_body"]',
        typeFilter: ['게임H/W', '게임S/W', 'PC/가전', 'A/V', 'VR'],
        iconURL: 'https://img.ruliweb.com/img/2016/icon/ruliweb_icon_144_144.png',
        dataKey: 'ruri_digital'
    },
    {
        name: '쪼드',
        url: 'https://zod.kr/deal',
        selector: 'ul[class^="app-board-template-list zod-board-list--deal"] > li:not(.notice):not(.zod-board-list--deal-ended)',
        typeFilter: ['PC 하드웨어', '모바일 / 가젯', '노트북', '가전', '게임 / SW'],
        iconURL: 'https://zod.kr/files/attach/xeicon/favicon.ico?t=1731517578',
        dataKey: 'zod_digital',
        useFlaresolverr: true
    }
];

const sitesEvery20: SiteConfig[] = [
    {
        name: '퀘이사존',
        url: 'https://quasarzone.com/bbs/qb_saleinfo',
        selector: 'div[class^="market-type-list market-info-type-list relative"] > table > tbody > tr',
        typeFilter: ['PC/하드웨어', '게임/SW', '노트북/모바일', '가전/TV'],
        iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE353R6jMRwECRZPAis-gAZjFey1dfi-A9jZuSWmy2FOE3iEU573TKhpSqm5G2G54Zz_Y&usqp=CAU',
        dataKey: 'quasa_digital'
    },
    {
        name: '쿨앤조이',
        url: 'https://coolenjoy.net/bbs/jirum',
        selector: '#bo_list > ul > li',
        typeFilter: ['PC관련', '게임', '모바일', '가전'],
        iconURL: 'http://photo.coolenjoy.net/SWFUpload/resizedemo/saved/a0a7cbc96ab09e01e1f2d67f538d0bbe1.jpg',
        dataKey: 'coolnjoy_digital'
    },
    {
        name: '딜바다 국내',
        url: 'http://www.dealbada.com/bbs/board.php?bo_table=deal_domestic',
        selector: 'div.tbl_head01.tbl_wrap > table > tbody > tr',
        typeFilter: ['컴퓨터', '디지털', '가전'],
        iconURL: 'http://cdn.dealbada.com/img/fav_ocean.png',
        dataKey: 'deal_digital'
    },
    {
        name: '딜바다 해외',
        url: 'http://www.dealbada.com/bbs/board.php?bo_table=deal_oversea',
        selector: 'div.tbl_head01.tbl_wrap > table > tbody > tr',
        typeFilter: ['컴퓨터', '디지털', '가전', '시계'],
        iconURL: 'http://cdn.dealbada.com/img/fav_ocean.png',
        dataKey: 'fodeal_digital'
    },
    // Adding Zod to the 20min interval run per original script
    {
        name: '쪼드',
        url: 'https://zod.kr/deal',
        selector: 'ul[class^="app-board-template-list zod-board-list--deal"] > li:not(.notice):not(.zod-board-list--deal-ended)',
        typeFilter: ['PC 하드웨어', '모바일 / 가젯', '노트북', '가전', '게임 / SW'],
        iconURL: 'https://zod.kr/files/attach/xeicon/favicon.ico?t=1731517578',
        dataKey: 'zod_digital'
    }
];

// 매시간 10, 30, 50분에 실행
cron.schedule('10,30,50 * * * *', async () => {
    const todayDate = today();
    console.log(`[Scheduled] Hourly run started at: ${todayDate} (${new Date().toLocaleTimeString()})`);
    await runCrawling(sitesHourly, todayDate);
});

// 매시간 20, 40, 정각에 실행
cron.schedule('0,20,40 * * * *', async () => {
    const todayDate = today();
    console.log(`[Scheduled] Every 20 mins run started at: ${todayDate} (${new Date().toLocaleTimeString()})`);
    await runCrawling(sitesEvery20, todayDate);
});

// Run once on startup
(async () => {
    const todayDate = today();
    console.log(`[Startup] Initial run started at: ${todayDate} (${new Date().toLocaleTimeString()})`);
    await runCrawling(sitesHourly, todayDate);
    await runCrawling(sitesEvery20, todayDate);
})();

// 통합 크롤링 함수 (브라우저 1회 실행 후 순차 처리)
async function runCrawling(sites: SiteConfig[], todayDate: string) {
    try {
        for (const site of sites) {
            await processSite(site, todayDate);
        }
    } catch (e) {
        console.error("전체 크롤링 진행 중 오류:", e);
    }
}

// 일반 사이트용 HTML 페칭 (cloudscraper)
async function fetchHtmlCloudscraper(url: string, siteName: string): Promise<string | null> {
    try {
        const responseData = await cloudscraper.get({
            uri: url,
            encoding: null,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'max-age=0'
            }
        });
        return responseData;
    } catch (error: any) {
        console.error(`Error fetching HTML for ${siteName} (${url}):`, error.message);
        return null;
    }
}

// Cloudflare 차단 사이트용 HTML 페칭 (FlareSolverr)
const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || 'http://localhost:8191/v1';

async function fetchHtmlFlaresolverr(url: string, siteName: string): Promise<string | null> {
    try {
        const response = await axios.post(FLARESOLVERR_URL, {
            cmd: 'request.get',
            url: url,
            maxTimeout: 60000
        }, {
            timeout: 65000,
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data?.solution?.response) {
            console.log(`[FlareSolverr] ${siteName} HTML 수신 완료 (status: ${response.data.solution.status})`);
            return response.data.solution.response;
        } else {
            console.error(`[FlareSolverr] ${siteName} 응답에 HTML이 없습니다.`);
            return null;
        }
    } catch (error: any) {
        console.error(`[FlareSolverr] ${siteName} (${url}) 요청 실패:`, error.message);
        return null;
    }
}

// 사이트에서 게시판 내용 불러오기
async function processSite(site: SiteConfig, todayDate: string) {
    try {
        // Cloudflare 차단 사이트는 FlareSolverr, 나머지는 cloudscraper 사용
        let html: string | null;
        if (site.useFlaresolverr) {
            html = await fetchHtmlFlaresolverr(site.url, site.name);
        } else {
            html = await fetchHtmlCloudscraper(site.url, site.name);
        }

        if (!html) {
            console.error(`HTML content is undefined for ${site.name}`);
            return;
        }

        // FlareSolverr는 이미 문자열로 반환하므로 인코딩 분기
        let decodedHtml: string;
        if (site.useFlaresolverr) {
            decodedHtml = typeof html === 'string' ? html : iconv.decode(Buffer.from(html), 'UTF-8').toString();
        } else {
            const encoding = site.encoding || 'UTF-8';
            decodedHtml = iconv.decode(Buffer.from(html), encoding).toString();
        }

        const $ = cheerio.load(decodedHtml);
        const list: any[] = [];
        $(site.selector).each((i: number, elem: any) => { list.push(elem) });

        await processList(list, site, $, todayDate);
    } catch (error) {
        console.error(`Error HTML parsing for ${site.name}:`, error);
    }
}

//게시판내용을 역순으로 뒤집기
async function processList(list: any[], site: SiteConfig, $: any, todayDate: string) {
    if (list.length === 0) return;

    // We process from oldest to newest to maintain correct order of notifications
    const reversedList = [...list].reverse();

    // Retrieve the last known ID from the SQLite DB.
    let currentLastId = await getLastId(site.dataKey);

    for (const elem of reversedList) {
        const element = $(elem);
        const parser = getParser(site.name);

        if (!parser) {
            console.error(`No parser found for site: ${site.name}`);
            continue;
        }

        const itemData = parser.extract($, element, site, todayDate);

        if (itemData && shouldSend(itemData, site, currentLastId)) {
            sendEmbed(itemData, site);
            // After successfully dispatching, increment our local counter.
            currentLastId = itemData.id;
        }
    }

    // Persist the latest tracked ID to SQLite once the scrape cycle for this site is complete
    if (currentLastId !== 0) {
        await setLastId(site.dataKey, currentLastId);
    }
}

function shouldSend(itemData: ItemData | undefined, site: SiteConfig, lastId: number): boolean {
    if (!itemData) return false;

    // Check if ID is new
    if (lastId >= itemData.id) return false;

    // Check type filters if they exist
    if (site.typeFilter && site.typeFilter.length > 0) {
        if (!site.typeFilter.includes(itemData.type)) {
            return false;
        }
    }

    return true;
}

// 디스코드 내용 보내기
function sendEmbed(itemData: ItemData, site: SiteConfig) {
    if (isFiltered(itemData.name)) {
        return;
    }

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setAuthor({ name: site.name, iconURL: site.iconURL || '', url: site.url })
        .setTitle(`${itemData.type} ${itemData.name}`)
        .setURL(itemData.url)
        .setFooter({ text: `등록일: ${itemData.date}` });

    if (itemData.thumbnail) {
        const urlPattern = /^(http|https):\/\//;
        const thumbnailUrl = urlPattern.test(itemData.thumbnail) ? itemData.thumbnail : `http:${itemData.thumbnail}`;
        embed.setThumbnail(thumbnailUrl);
    }

    hooks.forEach(hook => hook.send({ embeds: [embed] }).catch(err => console.error("Discord send error:", err)));
}

// Graceful graceful shutdown for DB
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err.message);
        console.log('Close the database connection.');
        process.exit(0);
    });
});