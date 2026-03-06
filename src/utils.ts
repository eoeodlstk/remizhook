export function today(): string {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();
    return `${yyyy}/${mm}/${dd}`;
}

export function isFiltered(name: string): boolean {
    const filterKeywords = [
        '저렴하게', '현금', '지원금', '즉시지원', '성지', '방법', '개통', '구독', '최대', '여기서',
        '싸게 사는법', '혜택 총정리', '잘 주는곳', '곳 알기', '받아보세요', '알아보자', '정수기 추천',
        '신규가입', '재약정', '당일', '결합', '가입', '렌탈', '상담', '설치', '요금제', '알려',
        '이거야', '싼곳', '여기', '하세요'
    ];

    const matchedKeywords = filterKeywords.filter(keyword => {
        const keywordIndex = name.indexOf(keyword);
        if (keywordIndex === -1) return false;

        // 키워드 앞에 "역대"가 있는 경우 필터링 건너뛰기
        const prefix = name.substring(Math.max(0, keywordIndex - 2), keywordIndex); // 키워드 앞 2글자 추출
        if (prefix === '역대') return false;

        return true;
    });

    if (matchedKeywords.length > 0) {
        console.log(`"${name}" 항목은 필터링되어 건너뜁니다. 필터링된 키워드: ${matchedKeywords.join(', ')}`);
        return true;
    }

    return false;
}
