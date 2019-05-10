(function (global) {
    const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomItemFromArray = (arr) => arr[randomNumber(0, arr.length - 1)];
    const defalutTudouChar = [
        '滅', '苦', '婆', '娑', '耶', '陀', '跋', '多', '漫', '都', '殿', '悉', '夜', '爍', '帝', '吉',
        '利', '阿', '無', '南', '那', '怛', '喝', '羯', '勝', '摩', '伽', '謹', '波', '者', '穆', '僧',
        '室', '藝', '尼', '瑟', '地', '彌', '菩', '提', '蘇', '醯', '盧', '呼', '舍', '佛', '參', '沙',
        '伊', '隸', '麼', '遮', '闍', '度', '蒙', '孕', '薩', '夷', '迦', '他', '姪', '豆', '特', '逝',
        '朋', '輸', '楞', '栗', '寫', '數', '曳', '諦', '羅', '曰', '咒', '即', '密', '若', '般', '故',
        '不', '實', '真', '訶', '切', '一', '除', '能', '等', '是', '上', '明', '大', '神', '知', '三',
        '藐', '耨', '得', '依', '諸', '世', '槃', '涅', '竟', '究', '想', '夢', '倒', '顛', '離', '遠',
        '怖', '恐', '有', '礙', '心', '所', '以', '亦', '智', '道', '。', '集', '盡', '死', '老', '至'
    ];
    const defaultPrefix = "佛曰：";

    const sweetCharList = [
        '大', '家', '盛', '情', '难', '却', '，', '怎', '么', '办', '贝', 'a', 'y', '我', '们', '去',
        '淘', '宝', '领', '个', '证', '唔', '后', '程', '序', '员', '不', '会', '写', '代', '码', 'A',
        '丫', '嗯', '鸭', '次', '相', '亲', '就', '成', '功', '的', '话', '有', '八', '啊', '阿', '哥',
        '伊', '生', '麼', '遮', '闍', '度', '蒙', '孕', '薩', '夷', '迦', '他', '姪', '豆', '特', '逝',
        '朋', '輸', '楞', '栗', '寫', '數', '曳', '諦', '羅', '曰', '咒', '即', '密', '若', '般', '故',
        '门', '實', '真', '訶', '切', '一', '除', '能', '等', '是', '上', '明', '厦', '神', '知', '三',
        '藐', '耨', '得', '依', '諸', '世', '槃', '涅', '竟', '究', '想', '夢', '倒', '顛', '離', '遠',
        '生', '否', '癔', '礙', '心', '所', '以', '亦', '智', '道', '。', '集', '盡', '死', '老', '至'
    ];

    const sweetPrefix = "凯同雅说：";

    let tudouChar = defalutTudouChar;
    let prefix = defaultPrefix;

    class Kevin {
        static toBytes(text) {
            const tudouKeyWordList = Kevin.tudouKeyWord;
            const tudouCharList = tudouChar;
            const encodeBuffer = Array(text.length).fill(0);
            let j = 0;
            for (let i = 0; i < text.length; i++, j++) {
                if (tudouKeyWordList.includes(text[i])) {
                    encodeBuffer[j] =
                        tudouCharList.indexOf(text[i + 1]) ^ 0x80;
                    i++;
                } else {
                    encodeBuffer[j] = tudouCharList.indexOf(text[i]);
                }
            }
            const trimedBuffer = encodeBuffer.slice(0, j);
            return trimedBuffer;
        }

        static encode(originalString) {
            const originalBuffer = aesjs.utils.utf8.toBytes(originalString);
            // 补padding
            const buf = aesjs.padding.pkcs7.pad(originalBuffer);
            const aesCbc = new aesjs.ModeOfOperation.cbc(
                Kevin.key,
                Kevin.iv
            );
            const encodeBuffer = aesCbc.encrypt(buf);

            let tudouString = "";
            for (let i = 0; i < encodeBuffer.length; i++) {
                const byte = encodeBuffer[i];
                if (byte >= 0x80) {
                    tudouString += randomItemFromArray(Kevin.tudouKeyWord);
                    tudouString += tudouChar[byte ^ 0x80];
                } else {
                    tudouString += tudouChar[byte];
                }
            }
            return prefix + tudouString;
        }

        static decode(encodeText) {
            encodeText = encodeText.startsWith(prefix)
                ? encodeText.replace(prefix, "")
                : encodeText;
            const encodeArray = Kevin.toBytes(encodeText);
            const aesCbc = new aesjs.ModeOfOperation.cbc(
                Kevin.key,
                Kevin.iv
            );
            const decodeBuff = aesCbc.decrypt(encodeArray);

            return aesjs.utils.utf8.fromBytes(
                aesjs.padding.pkcs7.strip(decodeBuff)
            );
        }

        static use(mode) {
            if (mode === "Ayaa") {
                prefix = sweetPrefix;
                return Kevin.use(sweetCharList);
            } else if (
                Array.isArray(mode) &&
                mode.length === defalutTudouChar.length &&
                mode.every(s => typeof s === "string" && s.length === 1)
            ) {
                const set = new Set(tudouChar);
                if (0x80 > set.size) {
                    console.log(`tudouChar数组长度`, 0x80);
                    console.log(`set长度:`, set.size);
                    for (const i in tudouChar) {
                        if (
                            tudouChar.indexOf(tudouChar[i]) !==
                            tudouChar.lastIndexOf(tudouChar[i])
                        ) {
                            console.log("下标为：" + i);
                            console.log(
                                "数组中有重复元素：" + tudouChar[i]
                            );
                        }
                    }
                    throw new Error(`哪个天才提交的tudouChar有重复了`);
                }
                tudouChar = mode;
            } else {
                throw new Error(
                    `醒醒，参数必须是枚举值或者Array<Char>且char不可重复且暂时要求数组长度和默认值一样即128`
                );
            }
        }

        static setPrefix(pre) {
            if (typeof pre === "string") {
                prefix = pre;
                return true;
            } else {
                return false;
            }
        }

        static getPrefix(pre) {
            return prefix;
        }
    }

    Kevin.key = aesjs.utils.utf8.toBytes('XDXDtudou@KeyFansClub^_^Encode!!');
    Kevin.vector = aesjs.utils.utf8.toBytes('Potato@Key@_@=_=');
    Kevin.tudouKeyWord = ['吖', '錒', '娅', '我', '刘', '凯', '说', '对', '着', '吾', '困', '觉'];

    // export
    global.Kevin = Kevin;
})(window);
