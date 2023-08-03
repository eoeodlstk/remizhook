import Discord, {EmbedBuilder} from 'discord.js'
import dotenv from "dotenv"
import cheerio from 'cheerio'
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

// cron.schedule('*/20 7-23,0-3 * * *', async () => {
cron.schedule('*/10 * * * *', async () => {
    await ppomppu_computer()
    await foppomppu_computer()
    await foppomppu_digital()
    await ruriweb_digital()
    await quasar_digital()
    await coolnjoy_digital()
    await deal_digital()
    await fodeal_digital()
    saveData()
})


async function ppomppu_computer() {
    console.log('국내뽐뿌')
    const html = await axios.get('https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu', { responseType: 'arraybuffer' })
    const $ = cheerio.load(iconv.decode(Buffer.from(html.data), 'EUC-KR').toString())
    let list = []
    $('tr[class^="common-list1"],tr[class^="common-list0"]').each((i, elem) => list.push(elem)) //; list.push(elem)

    list.reverse().forEach((elem, i, arr) => {
        const element = $(elem)
        const id = parseInt($(element.find('td.eng.list_vspace')[0]).text().trim()) || 0
        //const type = $(element.find('nobr')[0]).text().trim()
        const type = element.find('td:nth-child(3)').find('table > tbody > tr > td:nth-child(2)').find("span:last").text().trim();
        const name = element.find('font.list_title').text().trim();
        const arrtt = ['[컴퓨터]','[디지털]', '[가전/가구]'];
        const url = element.find('table > tbody > tr > td > a').attr('href')
        const thumbnail = element.find('table > tbody > tr > td > a > img').attr('src')
        let date = ''
        if(element.find('td:nth-child(4)').attr('title') != undefined){
            date = element.find('td:nth-child(4)').attr('title').replace(/\./gi, '/')
        }
        if (arrtt.indexOf(type) >= 0 && name && data.ppomppu_computer != 0 && data.ppomppu_computer < id) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({name: '뽐뿌', iconURL: 'http://www.ppomppu.co.kr/favicon.ico', url: 'http://www.ppomppu.co.kr/'})
                .setTitle(`${type} ${name}`)
                .setURL(`https://www.ppomppu.co.kr/zboard/${url}`)
                .setFooter({text: `등록일: ${date}`})
            if (thumbnail) embed.setThumbnail(`http:${thumbnail}`)
            client.send({
                embeds: [embed],
            });
            data.ppomppu_computer = id
        }
        if (list.length == i + 1 && data.ppomppu_computer == 0) {
            data.ppomppu_computer = id
        }
    })
}

async function foppomppu_computer() {
    console.log('해외뽐뿌')
    const html = await axios.get('https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu4', { responseType: 'arraybuffer' })
    const $ = cheerio.load(iconv.decode(Buffer.from(html.data), 'EUC-KR').toString())
    let list = []
    $('tr[class^="common-list1"],tr[class^="common-list0"]').each((i, elem) => list.push(elem) ) //; list.push(elem)

    list.reverse().forEach((elem, i, arr) => {
        const element = $(elem)
        const id = parseInt($(element.find('td.eng.list_vspace')[0]).text().trim()) || 0
        const type = $(element.find('nobr')[0]).text().trim()
        const name = element.find('font.list_title').text().trim()
        const url = element.find('table > tbody > tr > td > a').attr('href')
        const thumbnail = element.find('table > tbody > tr > td > a > img').attr('src')
        let date = ''
        if(element.find('td:nth-child(4)').attr('title') != undefined){
            date = element.find('td:nth-child(4)').attr('title').replace(/\./gi, '/')
        }
        if (name && data.foppomppu_computer != 0 && data.foppomppu_computer < id) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({name: '해외뽐뿌', iconURL: 'http://www.ppomppu.co.kr/favicon.ico', url: 'http://www.ppomppu.co.kr/'})
                .setTitle(`[${type}] ${name}`)
                .setURL(`https://www.ppomppu.co.kr/zboard/${url}`)
                .setFooter({text: `등록일: ${date}`})
            if (thumbnail) embed.setThumbnail(`http:${thumbnail}`)
            client.send({
                embeds: [embed],
            });
            data.foppomppu_computer = id
        }
        if (list.length == i + 1 && data.foppomppu_computer == 0) {
            data.foppomppu_computer = id
        }
    })
}

async function foppomppu_digital() {
    console.log('알리뽐뿌')
    const html = await axios.get('https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu8', { responseType: 'arraybuffer' })
    const $ = cheerio.load(iconv.decode(Buffer.from(html.data), 'EUC-KR').toString())
    let list = []
    $('tr[class^="common-list1"],tr[class^="common-list0"]').each((i, elem) => list.push(elem) ) //; list.push(elem)

    list.reverse().forEach((elem, i, arr) => {
        const element = $(elem)
        const id = parseInt($(element.find('td.eng.list_vspace')[0]).text().trim()) || 0
        const type = $(element.find('nobr')[0]).text().trim()
        const name = element.find('font.list_title').text().trim()
        const url = element.find('table > tbody > tr > td > a').attr('href')
        const thumbnail = element.find('table > tbody > tr > td > a > img').attr('src')
        let date = ''
        if(element.find('td:nth-child(4)').attr('title') != undefined){
            date = element.find('td:nth-child(4)').attr('title').replace(/\./gi, '/')
        }
        if (name && data.foppomppu_digital != 0 && data.foppomppu_digital < id) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({name: '알리뽐뿌', iconURL: 'http://www.ppomppu.co.kr/favicon.ico', url: 'http://www.ppomppu.co.kr/'})
                .setTitle(`[${type}] ${name}`)
                .setURL(`https://www.ppomppu.co.kr/zboard/${url}`)
                .setFooter({text: `등록일: ${date}`})
            if (thumbnail) embed.setThumbnail(`http:${thumbnail}`)
            client.send({
                embeds: [embed],
            });
            data.foppomppu_digital = id
        }
        if (list.length == i + 1 && data.foppomppu_digital == 0) {
            data.foppomppu_digital = id
        }
    })
}
async function quasar_digital() {
    console.log('퀘이사존')
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            executablePath: process.env.CHROMIUM_PATH,
            args: [
                '--no-sandbox',
                '--ignore-certificate-errors' // Add this line
            ]
        });

        const page = await browser.newPage();
        await page.goto('https://quasarzone.com/bbs/qb_saleinfo', {
            waitUntil: 'networkidle0',
        });

        const html = await page.content();
        const $ = cheerio.load(iconv.decode(Buffer.from(html), 'UTF-8').toString())
        let list = []
        $('div[class^="market-type-list market-info-type-list relative"] > table > tbody > tr').each((i, elem) => list.push(elem))
        list.reverse().forEach((elem, i, arr) => {
            const element = $(elem)
            const tmid = element.find('div.thumb-wrap > a').attr('href');
            let regex = /\/views\/(\d+)/;
            let match = tmid.match(regex);
            let id = 0;
            if(match) {
                id = Number(match[1])  // Outputs the number after '/views/' in the href attribute
            }
            const type = element.find('span.category').text().trim()
            const arrtt = ['PC/하드웨어','게임/SW', '노트북/모바일', '가전/TV'];
            const markeinfo = element.find('div.market-info-list-cont > div.market-info-sub > p > span')
            const gha = $(markeinfo[1]).find('span').text()
            const bea = $(markeinfo[3]).text()
            const name = element.find('div.market-info-list-cont > p.tit > a > span.ellipsis-with-reply-cnt').text()
            const url = element.find('div.market-info-list-cont > p.tit > a ').attr('href')
            /*
            let thumbnail = element.find('div.thumb-wrap > a > img').attr('src')
            if(thumbnail == "/themes/quasarzone/images/common/no_images.jpg"){
                thumbnail = "https://quasarzone.com"+thumbnail
            }

             */
            let date = ''
            if (markeinfo.find('span.date').text().trim().length < 6) {
                date = today()
            } else date = markeinfo.find('span.date').text().trim().replace(/\./gi, '/')

            if (arrtt.indexOf(type) >= 0 && name && data.quasa_digital != 0 && data.quasa_digital < id) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setAuthor({name: '퀘이사존', iconURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE353R6jMRwECRZPAis-gAZjFey1dfi-A9jZuSWmy2FOE3iEU573TKhpSqm5G2G54Zz_Y&usqp=CAU', url: 'https://quasarzone.com/'})
                    .setTitle(`[${type}] ${name} (${gha} / ${bea})`)
                    .setURL(`https://quasarzone.com${url}`)
                    .setFooter({text: `등록일: ${date}`})
                    .setThumbnail(`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE353R6jMRwECRZPAis-gAZjFey1dfi-A9jZuSWmy2FOE3iEU573TKhpSqm5G2G54Zz_Y&usqp=CAU`)
                client.send({
                    embeds: [embed],
                });
                data.quasa_digital = id
            }

            if (list.length == i + 1 && data.quasa_digital == 0) {
                data.quasa_digital = id
            }
        })

        await browser.close();
    } catch (err) {
        console.error(err); // Use console.error to log errors
    }
}

async function ruriweb_digital() {
    console.log('루리')
    const html = await axios.get('https://bbs.ruliweb.com/market/board/1020', {responseType: 'arraybuffer'})
    const $ = cheerio.load(iconv.decode(Buffer.from(html.data), 'UTF-8').toString())
    let list = []
    $('tr[class^="table_body"]').each((i, elem) => list.push(elem))
    list.reverse().forEach((elem, i, arr) => {
        const element = $(elem)
        const id = parseInt($(element.find('td.id')[0]).text().trim()) || 0
        const type = $(element.find('td.divsn.text_over > a')[0]).text().trim()
        const arrtt = ['게임H/W','게임S/W', 'PC/가전', 'A/V', 'VR'];
        const name = element.find('td.subject > div > a.deco').text().trim()
        const url = element.find('td.subject > div > a.deco').attr('href')
        let date = ''
        if (element.find('td.time').text().trim().length < 6) {
            date = today()
        } else date = element.find('td.time').text().trim().replace(/\./gi, '/')
        if (arrtt.indexOf(type) >= 0 && url != undefined && name && data.ruri_digital != 0 && data.ruri_digital < id) {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({name: '루리웹', iconURL: 'https://img.ruliweb.com/img/2016/icon/ruliweb_icon_144_144.png', url: 'https://www.ruliweb.com/'})
                .setTitle(`[${type}] ${name}`)
                .setURL(`${url}`)
                .setFooter({text: `등록일: ${date}`})
                .setThumbnail(`https://img.ruliweb.com/img/2016/icon/ruliweb_icon_144_144.png`)
            client.send({
                embeds: [embed],
            });
            data.ruri_digital = id
        }
        if (list.length == i + 1 && data.ruri_digital == 0) {
            data.ruri_digital = id
        }
    })
}

async function coolnjoy_digital() {
    console.log('쿨앤조이')
    const html = await axios.get('https://coolenjoy.net/bbs/jirum', {responseType: 'arraybuffer'})
    const $ = cheerio.load(iconv.decode(Buffer.from(html.data), 'UTF-8').toString())
    let list = []
    $('#bo_list > ul > li').each((i, elem) => list.push(elem))
    list.reverse().forEach((elem, i, arr) => {
        const element = $(elem)
        const type = element.find('div#abcd').text().trim()
        const arrtt = ['PC관련','게임', '모바일', '가전'];
        if (arrtt.indexOf(type) >= 0){
            const id = parseInt(element.find('a.na-subject').attr('href').replace("https://coolenjoy.net/bbs/jirum/", "").trim()) || 0
            const name = $(element.find('a.na-subject')).text().trim()
            const url = element.find('a.na-subject').attr('href')
            const mount = element.find('div:nth-child(3) > font').text().trim()
            let date = ''
            if (element.find('div:nth-child(5) > span.sr-only').text().trim().length < 6) {
                date = today()
            } else date = element.find('div:nth-child(5) > span.sr-only').text().trim().replace(/\./gi, '/')
            if (arrtt.indexOf(type) >= 0 && name && data.coolnjoy_digital != 0 && data.coolnjoy_digital < id) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setAuthor({name: '쿨앤조이', iconURL: 'http://photo.coolenjoy.net/SWFUpload/resizedemo/saved/a0a7cbc96ab09e01e1f2d67f538d0bbe1.jpg', url: 'https://coolenjoy.net/'})
                    .setTitle(`[${type}] ${name} (${mount})`)
                    .setURL(`${url}`)
                    .setFooter({text: `등록일: ${date}`})
                    .setThumbnail(`http://photo.coolenjoy.net/SWFUpload/resizedemo/saved/a0a7cbc96ab09e01e1f2d67f538d0bbe1.jpg`)
                client.send({
                    embeds: [embed],
                });
                data.coolnjoy_digital = id
            }

            if (list.length == i + 1 && data.coolnjoy_digital == 0) {
                data.coolnjoy_digital = id
            }
        }
    })
}

async function deal_digital() {
    console.log('딜바다')
    const html = await axios.get('http://www.dealbada.com/bbs/board.php?bo_table=deal_domestic', {responseType: 'arraybuffer'})
    const $ = cheerio.load(iconv.decode(Buffer.from(html.data), 'UTF-8').toString())
    const today1 = new Date();
    const yyyy = today1.getFullYear();
    let list = []
    $('div.tbl_head01.tbl_wrap > table > tbody > tr').each((i, elem) => list.push(elem))
    list.reverse().forEach((elem, i, arr) => {
        const element = $(elem)
        const type = element.find('td.td_cate').text().trim()
        const arrtt = ['컴퓨터','디지털', '가전'];
        if (arrtt.indexOf(type) >= 0){
            const id = parseInt(element.find('td.td_num').text()) || 0
            const thumbnail = element.find('td.td_img > a > img').attr('src')
            const name = $(element.find('td.td_subject > a')[0]).text().substring(0, $(element.find('td.td_subject > a')[0]).text().indexOf("댓글")).trim()
            let url = element.find('td.td_subject > a').attr('href')
            let date = ''
            if (element.find('td.td_date').text().trim().indexOf(":") >= 0) {
                date = today()
            } else {
                date = ''+yyyy+'/'+element.find('td.td_date').text().trim().replace(/\-/gi, '/')
            }
            if (url.indexOf("http") < 0 ) {
                url = 'http:'+url
            }
            if (arrtt.indexOf(type) >= 0 && name && data.deal_digital != 0 && data.deal_digital < id) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setAuthor({name: '딜바다', iconURL: 'http://cdn.dealbada.com/img/fav_ocean.png', url: 'http://www.dealbada.com/'})
                    .setTitle(`[${type}] ${name}`)
                    .setURL(`${url}`)
                    .setFooter({text: `등록일: ${date}`})
                if (thumbnail) embed.setThumbnail(`${thumbnail}`)
                client.send({
                    embeds: [embed],
                });
                data.deal_digital = id
            }

            if (list.length == i + 1 && data.deal_digital == 0) {
                data.deal_digital = id
            }
        }
    })
}

async function fodeal_digital() {
    console.log('dhl딜바다')
    const html = await axios.get('http://www.dealbada.com/bbs/board.php?bo_table=deal_oversea', {responseType: 'arraybuffer'})
    const $ = cheerio.load(iconv.decode(Buffer.from(html.data), 'UTF-8').toString())
    const today1 = new Date();
    const yyyy = today1.getFullYear();
    let list = []
    $('div.tbl_head01.tbl_wrap > table > tbody > tr').each((i, elem) => list.push(elem))
    list.reverse().forEach((elem, i, arr) => {
        const element = $(elem)
        const type = element.find('td.td_cate').text().trim()
        const arrtt = ['컴퓨터','디지털', '가전','시계'];
        if (arrtt.indexOf(type) >= 0){
            const id = parseInt(element.find('td.td_num').text()) || 0
            const thumbnail = element.find('td.td_img > a > img').attr('src')
            const name = $(element.find('td.td_subject > a')[0]).text().substring(0, $(element.find('td.td_subject > a')[0]).text().indexOf("댓글")).trim()
            let url = element.find('td.td_subject > a').attr('href')
            let date = ''
            if (element.find('td.td_date').text().trim().indexOf(":") >= 0) {
                date = today()
            } else {
                date = ''+yyyy+'/'+element.find('td.td_date').text().trim().replace(/\-/gi, '/')
            }
            if (url.indexOf("http") < 0 ) {
                url = 'http:'+url
            }
            if (arrtt.indexOf(type) >= 0 && name && data.fodeal_digital != 0 && data.fodeal_digital < id) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setAuthor({name: '해외딜바다', iconURL: 'http://cdn.dealbada.com/img/fav_ocean.png', url: 'http://www.dealbada.com/'})
                    .setTitle(`[${type}] ${name}`)
                    .setURL(`${url}`)
                    .setFooter({text: `등록일: ${date}`})
                if (thumbnail) embed.setThumbnail(`${thumbnail}`)
                client.send({
                    embeds: [embed],
                });
                data.fodeal_digital = id
            }

            if (list.length == i + 1 && data.fodeal_digital == 0) {
                data.fodeal_digital = id
            }
        }
    })
}

function today(){
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();
    return `${yyyy}/${mm}/${dd}`;
}
