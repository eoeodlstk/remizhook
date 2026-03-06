import { SiteConfig, ItemData, SiteParser } from './types';
import { today } from '../utils';

// Helper for extracting text recursively (Ruliweb)
function extractText($: any, element: any): string {
    let text = '';
    $(element).contents().each((i, el: any) => {
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

const QUASAR_REGEX = /\/views\/(\d+)/;
const ZOD_REGEX = /\/deal\/(\d+)/;

export const PpomppuParser: SiteParser = {
    extract($: any, element: any, site: SiteConfig): ItemData | undefined {
        const id = parseInt($(element.find('td.baseList-space.baseList-numb')[0]).text().trim()) || 0;
        const type = element.find('td:nth-child(2)').find('small.baseList-small').text().trim();
        const name = element.find('td:nth-child(2)').find('span').text().trim();
        const turl = element.find('td:nth-child(2)').find('a.baseList-thumb').attr('href');
        const thumbnail = element.find('td:nth-child(2)').find('a.baseList-thumb').find('img').attr('src') || '';
        const date = element.find('td:nth-child(4)').attr('title')?.replace(/\./gi, '/') || '';
        return { id, type, name, url: `https://www.ppomppu.co.kr/zboard/${turl}`, thumbnail, date };
    }
};

export const QuasarParser: SiteParser = {
    extract($: any, element: any, site: SiteConfig, todayDate: string): ItemData | undefined {
        const tmid = element.find('div.thumb-wrap > a').attr('href') || '';
        let match = tmid.match(QUASAR_REGEX);
        let id = match ? Number(match[1]) : 0;

        const type = element.find('span.category').text().trim();
        const markeinfo = element.find('div.market-info-list-cont > div.market-info-sub > p > span');
        const name = element.find('div.market-info-list-cont > p.tit > a > span.ellipsis-with-reply-cnt').text();
        const url = element.find('div.market-info-list-cont > p.tit > a ').attr('href') || '';

        let thumbnail = element.find('div.thumb-wrap > a > img').attr('src') || '';
        if (thumbnail === "/themes/quasarzone/images/common/thumb_no_image.svg") {
            thumbnail = "https://quasarzone.com" + thumbnail;
        }

        let date = markeinfo.find('span.date').text().trim();
        date = date.length < 6 ? todayDate : date.replace(/\./gi, '/');

        return { id, type, name, url: `https://quasarzone.com${url}`, thumbnail, date };
    }
};

export const RuliwebParser: SiteParser = {
    extract($: any, element: any, site: SiteConfig, todayDate: string): ItemData | undefined {
        const id = parseInt($(element.find('td.id')[0]).text().trim()) || 0;
        const type = $(element.find('td.divsn.text_over > a')[0]).text().trim();
        const name = extractText($, $(element.find('td.subject > div > a.deco')));
        const url = element.find('td.subject > div > a.deco').attr('href') || '';

        let date = element.find('td.time').text().trim();
        date = date.length < 6 ? todayDate : date.replace(/\./gi, '/');
        const thumbnail = `https://img.ruliweb.com/img/2016/icon/ruliweb_icon_144_144.png`;

        return { id, type, name, url, thumbnail, date };
    }
};

export const CoolnjoyParser: SiteParser = {
    extract($: any, element: any, site: SiteConfig, todayDate: string): ItemData | undefined {
        const urlAttr = element.find('a.na-subject').attr('href') || '';
        const id = parseInt(urlAttr.replace("https://coolenjoy.net/bbs/jirum/", "").trim()) || 0;
        const type = element.find('div#abcd').text().trim();
        const name = $(element.find('a.na-subject')).text().trim();
        const url = urlAttr;

        let date = element.find('div:nth-child(5) > span.sr-only').text().trim();
        date = date.length < 6 ? todayDate : date.replace(/\./gi, '/');
        const thumbnail = `http://photo.coolenjoy.net/SWFUpload/resizedemo/saved/a0a7cbc96ab09e01e1f2d67f538d0bbe1.jpg`;

        return { id, type, name, url, thumbnail, date };
    }
};

export const DealbadaParser: SiteParser = {
    extract($: any, element: any, site: SiteConfig, todayDate: string): ItemData | undefined {
        const id = parseInt(element.find('td.td_num').text()) || 0;
        const type = element.find('td.td_cate').text().trim();
        const thumbnail = element.find('td.td_img > a > img').attr('src') || '';
        const name = $(element.find('td.td_subject > a')).text();

        let dateStr = element.find('td.td_date').text().trim();
        let date = dateStr.includes(":") ? todayDate : `${new Date().getFullYear()}/${dateStr.replace(/\-/gi, '/')}`;

        let url = element.find('td.td_subject > a').attr('href') || '';
        if (url && !url.includes("http")) {
            url = 'http:' + url;
        }

        return { id, type, name, url, thumbnail, date };
    }
};

export const ArcaParser: SiteParser = {
    extract($: any, element: any, site: SiteConfig, todayDate: string): ItemData | undefined {
        const href = element.find('a.title.hybrid-title').attr('href') || '';
        const idStr = href.replace("/b/hotdeal/", "").replace("?p1", "");
        const id = parseInt(idStr) || 0;

        const type = element.find('a.badge').text().trim();
        const title = element.find('a.title.hybrid-title').text().replace(/\n|\[\d+\]/g, '').trim();
        const price = element.find('a.title.hybrid-bottom').find('div.vrow-bottom.deal').find('span.deal-price').text().trim();
        const dele = element.find('a.title.hybrid-bottom').find('div.vrow-bottom.deal').find('span.deal-delivery').text().trim();

        const name = `${title}(${price}/${dele})`;
        const url = `https://arca.live${href}`;

        let thumbnail = element.find('a.title.preview-image').find('div.vrow-preview').find('img').attr('src') || '';
        if (thumbnail.split('?')[0].endsWith('.gif')) {
            thumbnail = "";
        }

        return { id, type, name, url, thumbnail, date: todayDate };
    }
};

export const ZodParser: SiteParser = {
    extract($: any, element: any, site: SiteConfig, todayDate: string): ItemData | undefined {
        const content = element.find('a.tw-flex-1');
        const thumbnail = element.find('div.app-thumbnail').find('img').attr('src') || '';
        const turl = content.attr('href') || '';

        const turlNumberMatch = turl.match(ZOD_REGEX);
        const id = parseInt(turlNumberMatch ? turlNumberMatch[1] : '0');

        const tname = content.find('div.app-list-title.tw-flex-wrap').find('span').text().trim();
        const priceElement = content.find('span:contains("가격:")').find('strong');
        const shippingElement = content.find('span:contains("배송비:")').find('strong');
        const type = content.find('div.app-list-meta').find('span.zod-board--deal-meta-category').text().trim();
        const date = content.find('span[title]').attr('title') || todayDate;

        const priceValue = priceElement.length ? priceElement.text().trim() : '';
        const shippingValue = shippingElement.length ? shippingElement.text().trim() : '';
        const name = `${tname}  (${priceValue}/${shippingValue})`;

        return { id, type, name, url: `https://zod.kr${turl}`, thumbnail, date };
    }
};

export const getParser = (siteName: string): SiteParser | undefined => {
    switch (siteName) {
        case '뽐뿌':
        case '해외뽐뿌':
        case '알리뽐뿌':
            return PpomppuParser;
        case '퀘이사존':
            return QuasarParser;
        case '루리웹':
            return RuliwebParser;
        case '쿨앤조이':
            return CoolnjoyParser;
        case '딜바다 국내':
        case '딜바다 해외':
            return DealbadaParser;
        case '핫딜채널':
            return ArcaParser;
        case '쪼드':
            return ZodParser;
        default:
            return undefined;
    }
};
