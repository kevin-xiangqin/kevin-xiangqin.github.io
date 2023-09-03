(function (global) {
    const crypto = require('crypto')
    const Buffer = require('buffer').Buffer
    const iconvlite = require('iconv-lite')

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
    // 类身上的静态方法use来修改TudouChar
    let tudouChar = defalutTudouChar;
    const defaultPrefix = "佛曰：";
    const sweetPrefix = "凯文语录：";
    const defaultTudouKeyWord = ['冥', '奢', '梵', '呐', '俱', '哆', '怯', '諳', '罰', '侄', '缽', '皤'];
    const sweetTudouKeyWord = ['放', '敵', '霸', '之', '刘', '凯', '收', '馬', '虎', '兔', '龍', '周'];
    // 类身上的静态方法setPrefix来修改前缀
    let prefix = defaultPrefix;
    // 被加密后文字的前缀之后正文之前的文字，加盐的标志位
    const saltPrefix = "我有一盐，请诸位静听。";
    const HasSalt = (decodeText) => decodeText.startsWith(saltPrefix);

    // export item
    var Mode;
    (function (Mode) {
        Mode["KevinTalk"] = "KevinTalk";
        Mode["BuddaTalk"] = "BuddaTalk";
    })(Mode || (Mode = {}));

    // export item
    class Kevin {
        static { this.key = 'XDXDtudou@KeyFansClub^_^Encode!!'; }
        static { this.vector = 'Potato@Key@_@=_='; }
        // 取值分隔符，算得上高频字
        static { this.tudouKeyWord = defaultTudouKeyWord; }
        static toBytes(tudouString) {
            const tudouKeyWordList = Kevin.tudouKeyWord;
            const tudouCharList = tudouChar;
            const encodeBuffer = Array(tudouString.length).fill(0);
            let j = 0;
            for (let i = 0; i < tudouString.length; i++, j++) {
                if (tudouKeyWordList.includes(tudouString[i])) {
                    encodeBuffer[j] = tudouCharList.indexOf(tudouString[i + 1]) ^ 0x80;
                    i++;
                }
                else {
                    encodeBuffer[j] = tudouCharList.indexOf(tudouString[i]);
                }
            }
            const trimedBuffer = encodeBuffer.slice(0, j);
            return trimedBuffer;
        }
        static getFinalKey(salt) {
            // 最大字节数
            const maxByteLength = 32;
            if (Buffer.from(salt).length > maxByteLength) {
                // 为了盐值唯一，如果超长，超出的部分无论如何变化都不会影响结果，给人误会
                throw new Error(`朋友，你的盐值长度超长了,最多${maxByteLength}bytes. 注意是字节不是字数`);
            }
            return Buffer.from(`${salt}${Kevin.key}`).slice(0, maxByteLength).toString();
        }
        static encode(originalString, salt = "", hasPrefix = true) {
            // 按小端解
            const originalBuffer = iconvlite.encode(originalString, 'UTF-16LE');
            // use aes-256-cbc
            const cipher = crypto.createCipheriv('aes-256-cbc', salt ? Kevin.getFinalKey(salt) : Kevin.key, Kevin.vector);
            const encodeBuffer = Buffer.concat([
                cipher.update(originalBuffer),
                cipher.final()
            ]);
            const tudouString = encodeBuffer.reduce((result, buffer) => {
                const byte = buffer;
                if (byte >= 0x80) {
                    result += randomItemFromArray(Kevin.tudouKeyWord);
                    result += tudouChar[byte ^ 0x80];
                }
                else {
                    result += tudouChar[byte];
                }
                return result;
            }, '');
            const content = salt ? `${saltPrefix}${tudouString}` : tudouString;
            return hasPrefix ? `${prefix}${content}` : content;
        }
        static decode(encodeText, salt) {
            encodeText = encodeText.replace(new RegExp(`^${prefix}`), '');
            if (salt && HasSalt(encodeText)) {
                encodeText = encodeText.replace(saltPrefix, '');
            }
            const encodeArray = Kevin.toBytes(encodeText);
            const decipher = crypto.createDecipheriv('aes-256-cbc', salt ? Kevin.getFinalKey(salt) : Kevin.key, Kevin.vector);
            const encodeBuffer = Buffer.from(encodeArray);
            const decodeBuff = Buffer.concat([
                decipher.update(encodeBuffer),
                decipher.final()
            ]);
            return iconvlite.decode(decodeBuff, 'UTF-16LE');
        }
        static use(mode, tudouKeyWord) {
            // 动态替换所以要动态校验
            if (mode === Mode.KevinTalk) {
                Kevin.setPrefix(sweetPrefix);
                // 不要直接写TudouChar = sweetCharList 还是按程序走执行下校验
                return Kevin.use(sweetCharList, sweetTudouKeyWord);
            }
            else if (mode === Mode.BuddaTalk) {
                Kevin.setPrefix(defaultPrefix);
                return Kevin.use(defalutTudouChar, defaultTudouKeyWord);
            }
            else if (Array.isArray(mode) &&
                mode.length === defalutTudouChar.length &&
                mode.every(s => typeof s === 'string' && s.length === 1)) {
                if (tudouKeyWord) {
                    Kevin.tudouKeyWord = tudouKeyWord;
                }
                else {
                    Kevin.tudouKeyWord = defaultTudouKeyWord;
                }
                // 验证数组里有没有重复字
                const set = new Set(mode);
                if (0x80 > set.size) {
                    console.log(`tudouChar数组长度`, 0x80);
                    console.log(`传入的数组转set后长度:`, set.size);
                    Object.entries(mode).forEach(([key, value]) => {
                        if (mode.indexOf(value) !== mode.lastIndexOf(value)) {
                            console.log('下标为：' + key);
                            console.log('数组中有重复元素：' + value);
                        }
                    });
                    throw new Error(`哪个天才提交的tudouChar有重复了`);
                }
                tudouChar = mode;
            }
            else {
                throw new Error(`醒醒，参数必须是枚举值或者Array<Char>且char不可重复且暂时要求数组长度和默认值一样即128`);
            }
        }
        static setPrefix(p) {
            prefix = p;
        }
        static getPrefix() {
            return prefix;
        }
    }

    // export
    global.Kevin = Kevin;
    global.Mode = Mode;
})(window);
