const createKeywords = (name) => {
    const arrName = [];
    let curName = '';
    name.toLowerCase().split('').forEach(letter=> {
        curName += letter;
        arrName.push(curName);
    });
    return arrName;
};

const generateKeywords = (names) => {
    const [first, last, mothers] = names;
    const keywordFullName = createKeywords(`${first} ${last} ${mothers}`);
    const keywordLastNameFirst = createKeywords(`${last} ${mothers} ${first}`);
    const keywordOnlyMothers = createKeywords(mothers);

    return [
        ...new Set([
            '',
            ...keywordFullName,
            ...keywordLastNameFirst,
            ...keywordOnlyMothers
        ]),
    ];
};

const calculateAge = (birthdate) => {
    const bd = new Date(birthdate)
    const diff = Date.now() - bd.getTime();
    const ageDiff = new Date(diff);
    return Math.abs(ageDiff.getUTCFullYear()-1970);
}

export { generateKeywords, calculateAge };