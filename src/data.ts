import * as fs from 'fs'

class Data {
    ppomppu_computer: number = 0
    foppomppu_computer: number = 0
    foppomppu_digital: number = 0
    quasa_digital : number = 0
    ruri_digital: number = 0
    coolnjoy_digital: number = 0
    deal_digital: number = 0
    fodeal_digital: number = 0
    hotdeal_chanel: number = 0
}

export let data = new Data()
export const defData = new Data()
export function loadData(file: string = './data.json') {
    if (fs.existsSync(file)) {
        setData(JSON.parse(fs.readFileSync(file, 'utf8')))
    }
}
export function saveData(file: string = './data.json') {
    console.log('데이터 저장')
    fs.writeFileSync(file, JSON.stringify(data, null, 4))
}

function setData(obj, parent?) {
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value == 'object' && !Array.isArray(value)) {
            setData(value, (parent) ? parent[key] : data[key])
        } else {
            if (parent && key in parent) {
                parent[key] = value
            } else if (key in data) {
                data[key] = value
            }
        }
    }
}