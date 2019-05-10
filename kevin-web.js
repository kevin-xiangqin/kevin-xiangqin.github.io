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
        '我', '们', '零', '后', 'K', 'e', 'v', 'i', 'n', 'J', 'S', '天', '下', '第', '一', '上',
        '过', '清', '华', '啊', '跪', '求', '打', '赏', '的', '图', '你', '花', '好', '了', '吗', '准',
        '备', '市', '感', '觉', '也', '可', '以', '决', '定', '水', '篇', '博', '客', '三', '十', '岁',
        '稳', '重', '点', '不', '要', '扰', '在', '知', '乎', '谈', '人', '生', '理', '想', '最', '什',
        '么', '都', '有', '没', '彼', '此', '已', '经', '成', '名', '多', '年', '，', '需', '宣', '传',
        '窝', '门', '凌', '厚', '忝', '侠', '递', '锅', '郭', '果', '敢', '赶', '阿', '地', '得', '涂',
        '拟', '昵', '霓', '虹', '并', '日', '本', '涅', '竟', '究', '乡', '夢', '倒', '顛', '離', '遠',
        '呗', '吧', '巴', '留', '流', '青', '蓝', '世', '难', '道', '。', '写', '盡', '死', '老', '至'
    ];

    const sweetPrefix = "凯文语录：";

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
            // ana means 语录
            if (mode === "ana") {
                prefix = sweetPrefix;
                return Kevin.use(sweetCharList);
            } else if (
                Array.isArray(mode) &&
                mode.length === defalutTudouChar.length &&
                mode.every(s => typeof s === "string" && s.length === 1)
            ) {
                const set = new Set(mode);
                if (0x80 > set.size) {
                    console.log(`tudouChar数组长度`, 0x80);
                    console.log(`传入的数组转set后长度:`, set.size);
                    for (const i in mode) {
                        if (
                            mode.indexOf(mode[i]) !==
                            mode.lastIndexOf(mode[i])
                        ) {
                            console.log("下标为：" + i);
                            console.log(
                                "数组中有重复元素：" + mode[i]
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
    Kevin.tudouKeyWord = ['放', '敵', '霸', '之', '刘', '凯', '收', '馬', '虎', '兔', '龍', '周'];

    // export
    global.Kevin = Kevin;
})(window);
