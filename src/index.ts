import Discord, {EmbedBuilder} from 'discord.js'
import dotenv from "dotenv"
import * as cheerio from 'cheerio';
import axios from 'axios'
import iconv from 'iconv-lite'
import cron from 'node-cron'
import {data, loadData, saveData} from './data'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin());
dotenv.config()
loadData()
const client = new Discord.WebhookClient({id: process.env.DISCORDBOT, token:process.env.DISCORDTOKEN})
const sites = [
    {
        name: '뽐뿌',
        url: 'https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu',
        selector: 'tr[class^="baseList bbs_new1"]',
        typeFilter: ['[컴퓨터]', '[디지털]', '[가전/가구]'],
        iconURL: 'http://www.ppomppu.co.kr/favicon.ico',
        dataKey: 'ppomppu_computer'
    },
    {
        name: '해외뽐뿌',
        url: 'https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu4',
        selector: 'tr[class^="baseList bbs_new1"]',
        iconURL:  'http://www.ppomppu.co.kr/favicon.ico',
        dataKey: 'foppomppu_computer'
    },
    {
        name: '알리뽐뿌',
        url: 'https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu8',
        selector: 'tr[class^="baseList bbs_new1"]',
        iconURL: 'http://www.ppomppu.co.kr/favicon.ico',
        dataKey: 'foppomppu_digital'
    },
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
        dataKey: 'coolnjoy_digital',
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
        iconURL:  'http://cdn.dealbada.com/img/fav_ocean.png',
        dataKey: 'fodeal_digital'
    },
    {
        name: '핫딜채널',
        url: 'https://arca.live/b/hotdeal',
        selector: 'div[class^="list-table hybrid"] > div[class^="vrow hybrid"]',
        typeFilter: ['전자제품', 'PC/하드웨어', 'SW/게임', '임박', '기타'],
        iconURL: 'https://arca.live/static/favicon.ico',
        dataKey: 'hotdeal_chanel'
    },
    {
        name: '루리웹',
        url: 'https://bbs.ruliweb.com/market/board/1020',
        selector: 'tr[class^="table_body"]',
        typeFilter: ['게임H/W', '게임S/W', 'PC/가전', 'A/V', 'VR'],
        iconURL: 'https://img.ruliweb.com/img/2016/icon/ruliweb_icon_144_144.png',
        dataKey: 'ruri_digital',
        useAxios:true
    },

];

cron.schedule('*/20 * * * *', async () => {
    const todayDate = today();
    console.log(todayDate);
    await Promise.all(sites.map(site => processSite(site, todayDate)));
    saveData();
});

async function processSite(site, todayDate) {
    try {
        const html = site.useAxios ? await fetchHtmlAxios(site.url) : await fetchHtmlPuppeteer(site);
        if (!html) {
            console.error(`HTML content is undefined for ${site.name}`);
            return;
        }
        const $ = cheerio.load(iconv.decode(Buffer.from(html), 'UTF-8').toString());
        const list = [];
        $(site.selector).each((i, elem) => list.push(elem));
        await processList(list, site, $, todayDate);
    } catch (error) {
        console.error(`Error processing ${site.name}:`, error);
    }
}

async function processList(list, site, $, todayDate) {
    if(list.length > 0 ) {
        list.reverse().forEach(elem => {
            const element = $(elem);
            const itemData = extractItemData($, element, site, todayDate);
            if (itemData && shouldSend(itemData, site)) {
                sendEmbed(itemData, site);
                data[site.dataKey] = itemData.id;
            }
            // 초기값 설정 로직은 마지막 요소 처리 후 한번만 실행하는 것이 좋습니다.
            if (list.length === 1 && data[site.dataKey] === 0 && itemData) {
                data[site.dataKey] = itemData.id;
            }
        });
    }

}

function extractItemData($,element, site, todayDate) {
    switch (site.name) {
        case '뽐뿌 컴퓨터':
        case '해외뽐뿌':
        case '알리뽐뿌':
            return extractPpOmppuData($,element, site);
        case '퀘이사존':
            return extractQuasarData($,element, site, todayDate);
        case '루리웹':
            return extractRuliwebData($,element, site, todayDate);
        case '쿨앤조이':
            return extractCoolnjoyData($,element, site, todayDate);
        case '딜바다 국내':
        case '딜바다 해외':
            return extractDealbadaData($,element, site, todayDate);
        case '핫딜채널':
            return extractArcaData($,element, site, todayDate);
        default:
            return;
    }
}

function extractPpOmppuData($,element, site) {
    const id = parseInt($(element.find('td.baseList-space.baseList-numb')[0]).text().trim()) || 0
    const type = element.find('td:nth-child(2)').find('small.baseList-small').text().trim();
    const name = element.find('td:nth-child(2)').find('span').text().trim();
    const turl = element.find('td:nth-child(2)').find('a.baseList-thumb').attr('href')
    const thumbnail = element.find('td:nth-child(2)').find('a.baseList-thumb').find('img').attr('src')
    const date = element.find('td:nth-child(4)').attr('title')?.replace(/\./gi, '/') || '';
    return { id, type, name, url: `https://www.ppomppu.co.kr/zboard/${turl}`, thumbnail, date };
}

function extractQuasarData($,element, site, todayDate) {
    const tmid = element.find('div.thumb-wrap > a').attr('href');
    let regex = /\/views\/(\d+)/;
    let match = tmid.match(regex);
    let id = 0;
    if(match) {
        id = Number(match[1])  // Outputs the number after '/views/' in the href attribute
    }
    const type = element.find('span.category').text().trim()
    const markeinfo = element.find('div.market-info-list-cont > div.market-info-sub > p > span')
    const gha = $(markeinfo[1]).find('span').text()
    const bea = $(markeinfo[3]).text()
    const name = element.find('div.market-info-list-cont > p.tit > a > span.ellipsis-with-reply-cnt').text()
    const url = element.find('div.market-info-list-cont > p.tit > a ').attr('href')
    let thumbnail = element.find('div.thumb-wrap > a > img').attr('src')
    if(thumbnail == "/themes/quasarzone/images/common/no_images.jpg"){
        thumbnail = "https://quasarzone.com"+thumbnail
    }
    //const thumbnail = `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE353R6jMRwECRZPAis-gAZjFey1dfi-A9jZuSWmy2FOE3iEU573TKhpSqm5G2G54Zz_Y&usqp=CAU`;
    let date = ''
    if (markeinfo.find('span.date').text().trim().length < 6) {
        date = today()
    } else date = markeinfo.find('span.date').text().trim().replace(/\./gi, '/')
    return { id, type, name, url:`https://quasarzone.com${url}`, thumbnail, date };
}

function extractText($, element) {
    let text = '';
    $(element).contents().each((i, el) => {
        if (el.type === 'text') {
            text += el.data;
        } else if (el.type === 'tag') {
            if (el.name !== 'a') {
                text += extractText($, $(el));
            }
            if (el.name === 'a') {
                text += $(el).text();
            }
        }
    });
    return text.trim();
}

function extractRuliwebData($,element, site, todayDate) {
    const id = parseInt($(element.find('td.id')[0]).text().trim()) || 0
    const type = $(element.find('td.divsn.text_over > a')[0]).text().trim()
    const name = extractText($, $(element.find('td.subject > div > a.deco')));
    const url = element.find('td.subject > div > a.deco').attr('href');
    let date = ''
    if (element.find('td.time').text().trim().length < 6) {
        date = today()
    } else date = element.find('td.time').text().trim().replace(/\./gi, '/')
    const thumbnail = `https://img.ruliweb.com/img/2016/icon/ruliweb_icon_144_144.png`;
    return { id, type, name, url, thumbnail, date };
}

function extractCoolnjoyData($,element, site, todayDate) {
    const id = parseInt(element.find('a.na-subject').attr('href').replace("https://coolenjoy.net/bbs/jirum/", "").trim()) || 0;
    const type = element.find('div#abcd').text().trim();
    const name = $(element.find('a.na-subject')).text().trim()
    const url = element.find('a.na-subject').attr('href')
    const mount = element.find('div:nth-child(3) > font').text().trim()
    let date = ''
    if (element.find('div:nth-child(5) > span.sr-only').text().trim().length < 6) {
        date = today()
    } else date = element.find('div:nth-child(5) > span.sr-only').text().trim().replace(/\./gi, '/')
    const thumbnail = `http://photo.coolenjoy.net/SWFUpload/resizedemo/saved/a0a7cbc96ab09e01e1f2d67f538d0bbe1.jpg`;
    return { id, type, name, url, thumbnail, date };
}

function extractDealbadaData($,element, site, todayDate) {
    const id = parseInt(element.find('td.td_num').text()) || 0
    const type = element.find('td.td_cate').text().trim()
    const thumbnail = element.find('td.td_img > a > img').attr('src')
    const today1 = new Date();
    const yyyy = today1.getFullYear();
    const name = $(element.find('td.td_subject > a')).text()
    let date = '';
    if (element.find('td.td_date').text().trim().indexOf(":") >= 0) {
        date = today()
    } else {
        date = ''+yyyy+'/'+element.find('td.td_date').text().trim().replace(/\-/gi, '/')
    }
    let url = element.find('td.td_subject > a').attr('href')
    if (url.indexOf("http") < 0 ) {
        url = 'http:'+url
    }

    return { id, type, name, url, thumbnail, date };
}

function extractArcaData($,element, site, todayDate) {
    const id = parseInt(element.find('a.title.hybrid-title').attr('href').replace("/b/hotdeal/", "").replace("?p1", ""))
    const type = element.find('a.badge').text().trim();
    const title = element.find('a.title.hybrid-title').text().replace(/\n|\[\d+\]/g, '').trim();
    const price = element.find('a.title.hybrid-bottom').find('div.vrow-bottom.deal').find('span.deal-price').text().trim()
    const dele = element.find('a.title.hybrid-bottom').find('div.vrow-bottom.deal').find('span.deal-delivery').text().trim()
    const name = title+"("+price+"/"+dele+")"
    const url = element.find('a.title.hybrid-title').attr('href')
    let thumbnail = element.find('a.title.preview-image').find('div.vrow-preview').find('img').attr('src')
    if(thumbnail !== undefined) {
        if(thumbnail.split('?')[0].endsWith('.gif')){
            thumbnail = ""
        }
    }
    let date = today()
    return { id, type, name, url:`https://arca.live${url}`, thumbnail, date };
}

function sendEmbed(itemData, site) {
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setAuthor({ name: site.name, iconURL: site.iconURL || '', url: site.url })
        .setTitle(`${itemData.type} ${itemData.name}`)
        .setURL(itemData.url)
        .setFooter({ text: `등록일: ${itemData.date}` });
    if (itemData.thumbnail) {
        // 정규 표현식을 사용하여 URL이 http 또는 https로 시작하는지 확인
        const urlPattern = /^(http|https):\/\//;

        // URL이 http 또는 https로 시작하지 않으면 http:를 추가
        const thumbnailUrl = urlPattern.test(itemData.thumbnail)
            ? itemData.thumbnail
            : `http:${itemData.thumbnail}`;

        embed.setThumbnail(thumbnailUrl);
    }
    client.send({ embeds: [embed] });
}

function shouldSend(itemData, site) {
    return site.typeFilter ? site.typeFilter.includes(itemData.type) && data[site.dataKey] < itemData.id : data[site.dataKey] < itemData.id;
}

async function fetchHtmlPuppeteer(site) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.CHROMIUM_PATH,
        args: [
            '--no-sandbox',
            '--ignore-certificate-errors',
            '--disable-setuid-sandbox',
            '--dns-prefetch-disable', // DNS 프리페치 비활성화
        ],
        protocolTimeout: 60000,
    });
    let page;
    try {
        page = await browser.newPage();
        await page.goto(site.url, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 60000 });
        return await page.content();
    } catch (error) {
        console.error(`${site.name} Error fetching HTML with Puppeteer:`, error);
        let attempts = 0;
        const maxAttempts = 5;
        while (attempts < maxAttempts) {
            try {
                page = await browser.newPage();
                console.log(`Retrying to load the page... Attempt ${attempts + 1}`);
                await page.reload({ waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 60000 });
                return await page.content();
            } catch (reloadError) {
                console.error(`${site.name} Error reloading the page:`, reloadError);
                attempts++;
            }
        }
        console.error(`${site.name} Failed to load the page after ${maxAttempts} attempts.`);
        return; // 최대 시도 후에도 오류 발생 시 반환
    } finally {
        await browser.close();
    }
}

async function fetchHtmlAxios(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
    } catch (error) {
        console.error('Error fetching HTML with Axios:', error);
        return;
    }
}

function today(){
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();
    return `${yyyy}/${mm}/${dd}`;
}