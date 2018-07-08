const CryptoJs = require('crypto-js');

// フィルタのビット数
const BIT_OF_FILTER = process.argv[2] | 16;

// ハッシュ関数の個数
const NUMBER_OF_HASH_FUNC = process.argv[3] | 3;

// hash関数
const hashFunc = (target, bitOfFilter, indexOfHashFunc) => {
    // 1〜Mのハッシュ関数の選び方は良くないが、target + Mをハッシュ化対象とする
    const hash = parseInt(CryptoJs.SHA256(target + indexOfHashFunc).toString(),16);
    return hash % bitOfFilter;
};

// 値域が1〜Nのハッシュ関数を個数分生成
const getHashFuncList = (bitOfFilter) => {
    const hashFuncList = [];
    for (let index = 0; index < NUMBER_OF_HASH_FUNC; index++) {
        const mhashFunc = (target) => {
            return hashFunc(target, bitOfFilter, index);
        };
        hashFuncList.push(mhashFunc);
    }
    return hashFuncList
};

// 文字列からブルームフィルタを取得
const createBloomFilter = (target) => {
    const hashFuncList = getHashFuncList(BIT_OF_FILTER);
    const bloomfilter = new Set();
    hashFuncList.forEach(hashFunc => {
        bloomfilter.add(hashFunc(target));
    });
    return bloomfilter;
}

const addBloomFilter = (target, bloomfilter) => {
    const currentBloomFilter = createBloomFilter(target);
    currentBloomFilter.forEach(bit => {
        bloomfilter.add(bit);
    });
    return bloomfilter;
}

const createBloomFilterFromList = (targetList) => {
    let resultBloomFilter;
    let isFirst = true;
    targetList.forEach(target => {
        resultBloomFilter =
        isFirst ? createBloomFilter(target) : addBloomFilter(target, resultBloomFilter);
        isFirst = false;
    });
    return resultBloomFilter;
}

const checkBloomFilter = (target, bloomfilter) => {
    const targetBloomFilter = createBloomFilter(target);
    let isSame = true;

    targetBloomFilter.forEach(bit => {
        isSame = isSame && bloomfilter.has(bit);
    });
    return isSame;
};

// 探索目標文字列のリスト
const targetList = ["steemit", "bitcoin", "plasma"];

// 探索対象文字列のリスト
const subjectList = [
    "steemit",
    "plasma",
    "bitcoin",
    "STEEM",
    "ethereum",
    "liting network",
    ];

// ブルームフィルタ作成
const bloomfilter = createBloomFilterFromList(targetList);

// ブルームフィルタと等しいかチェックし、等しい場合は探索目標候補
// 等しくない場合は探索目標ではない
subjectList.forEach(subject =>{
    console.log(`subject is ${subject}`);
    console.log(`Does it contain? ${checkBloomFilter(subject, bloomfilter)}`);
});