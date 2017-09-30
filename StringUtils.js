

export class StringUtils {
	static _UID = Date.now();
	
	static repeat = function (str, times) {
		let ret = '';
		for (var i = 0; i < times; i++) ret += str;
		return ret;
	}

	static padLeft = function (str, len, fillChar = ' ') {
		if (null == fillChar || 0 == fillChar.length) throw 'invalid value for fillChar: "' + fillChar + '"';
		if (str.length < len) {
			const times = len - str.length;
			for (var i = 0; i < times; i++) {
				str = fillChar + str;
			}
		}
		return str;
	}

	static padRight = function (str, len, fillChar = ' ') {
		if (null == fillChar || 0 == fillChar.length) throw 'invalid value for fillChar: "' + fillChar + '"';
		if (str.length < len) {
			const times = len - str.length;
			for (var i = 0; i < times; i++) {
				str += fillChar;
			}
		}
		return str;
	}

	static ignoreWhiteSpace = function (str) {
		return str.replace(/[\t\r\n]|\s\s/g, '');
	}

	static stringsAreEqual = function (pre, next, caseSensitive = true) {
		return caseSensitive ? pre == next :
			pre.toUpperCase() == next.toUpperCase();
	}

	static camelCase = function (str, firstLowerCase = true) {
		return str.replace(/(^[a-z]|\-[a-z])/g, function (a, c, d) {
			return 0 == firstLowerCase && 0 == d ?
				a.replace(/-/, '').toLowerCase() :
				a.replace(/-/, '').toUpperCase();
		});
	}
	static trim = function (str) {
		return StringUtils.trimLeft(StringUtils.trimRight(str));
	}
	static trimLeft = function (str) {
		for (var len = str.length, i = 0; i < len; i++) {
			if (str.charCodeAt(i) > 32) return str.substring(i);
		}
		return '';
	}
	static trimRight = function (str) {
		for (var len = str.length, i = len; i > 0; i--) {
			if (str.charCodeAt(i - 1) > 32) return str.substring(0, i);
		}
		return '';
	}

	static startsWith = function (str, targetStr, start = 0) {
		return targetStr == str.substring(start, targetStr.length);
	}

	static endsWith = function (str, targetStr, end = void 0) {
		(void 0 === end || end > str.length) && (end = str.length);
		end -= targetStr.length;
		var subString = str.indexOf(targetStr, end);
		return -1 !== subString && subString === end;
	}

	static remove = function (str, targetStr, notCaseSensitive = true) {
		if (null == str) return '';
		const regExp = StringUtils.escapePattern(targetStr);
		const matchAll = notCaseSensitive ? 'g' : 'ig';
		return str.replace(new RegExp(regExp, matchAll), '');
	}

	static escapePattern = function (str) {
		return str.replace(/(\]|\[|\{|\}|\(|\)|\*|\+|\?|\.|\\)/g, '\\$1');
	}

	static escapeToUnicode = function (str) {
		const cpyStr = str;
		let res = '';
		for (var i = 0; i < cpyStr.length; i++) {
			res += StringUtils.escapeToUnicodeChar(cpyStr.substr(i, 1));
		}
		return res;
	}

	static escapeToUnicodeChar = function (char) {
		if (char < ' ' || char > '}') {
			for (var str = char.charCodeAt(0).toString(16); str.length < 4;) {
				str = '0' + str;
			}
			return '\\u' + str;
		}
		return char;
	}

	static replace = function (str, matchStr, replaceStr) { //从str中match matchStr片段，并替换为replaceStr
		let res = '';
		let ifMatched = false;
		const len = str.length;
		let matchLen = matchStr.length;
		for (var i = 0; i < len; i++) {
			if (str.charAt(i) == matchStr.charAt(0)) { //匹配到待匹配字符串的第一个字符
				ifMatched = true;
				for (var i = 0; i < matchLen; i++) {
					if (str.charAt(i + i) != matchStr.charAt(i)) { //连续匹配过程中失败,终止匹配
						ifMatched = false;
						break;
					}
				}
				if (ifMatched) {
					res += replaceStr, i += matchLen - 1; //i跳到匹配长度结束的位置
					continue;
				}
			}
			res += str.charAt(i); //追加未替换字符
		}
		return res;
	}

	static replaceVars = function (str, data, ignoreError = true, disableLog = false) {
		if (null == str) throw 'String can not be null';
		if (null == data) throw 'Object can not be null';
		/**
		 * match fucntion call
		 ${funcName(arg0,arg1)}
		 */
		return str.replace(/\$?\{([@#$%&\w\.]*)(\((.*?)\))?\}/gi, function (key, keyValue, funcName, argStr, j, k) {
			const levels = keyValue.split('.');
			let level = levels.shift();
			let dataPtr = data;
			while (levels.length) {
				dataPtr = dataPtr[level];
				level = levels.shift();
			}
			if (null != dataPtr && level in dataPtr) { //最终取到了最深层的数据的外层
				if ('function' != typeof dataPtr[level] || !funcName) return dataPtr[level];
				if (argStr) {
					var args = argStr.split(',').map(x => StringUtils.replaceVars(x, data));
					// for (var i = 0; i < argStr.length; i++) {
					// 	arr[i] = StringUtils.replaceVars(argStr[i], data);
					// }
				}
				if (disableLog) return dataPtr[level].apply(null, args);
				try {
					return dataPtr[level].apply(null, args);
				} catch (err) {
					console.log('Temple.util.type.StringUtils', 'Unable to replace var ' + key + ': ' + err.message);
				}
			}
			return ignoreError ? '{' + keyValue + '}' : (disableLog ? '*VALUE \'' + level + '\' NOT FOUND*' : '');
		});
	}

	static afterFirst = function (str, subStr) {
		if (null == str) return '';
		const firstIndex = str.indexOf(subStr);
		return -1 == firstIndex ? '' : (firstIndex += subStr.length, StringUtils.substr(firstIndex));
	}

	static afterLast = function (str, subStr) {
		if (null == str) return '';
		const lastIndex = str.lastIndexOf(subStr);
		return -1 == lastIndex ? '' : (lastIndex += subStr.length, StringUtils.substr(lastIndex));
	}

	static beforeFirst = function (str, subStr) {
		if (null == str) return '';
		const firstIndex = str.indexOf(subStr);
		return -1 == firstIndex ? '' : str.substr(0, firstIndex);
	}

	static beforeLast = function (str, subStr) {
		if (null == str) return '';
		const lastStr = str.lastIndexOf(subStr);
		return -1 == lastStr ? '' : str.substr(0, lastStr);
	}

	static between = function (str, startStr, endStr) {
		var ret = '';
		if (null == str) return ret;
		var startIndex = str.indexOf(startStr);
		if (-1 != startIndex) {
			startIndex += startStr.length;
		}
		var f = str.indexOf(endStr, startIndex);
		if (-1 != f) {
			ret = str.substr(startIndex, f - startIndex);
		}

		return ret;
	}
	static includes = function (str, subStr, start = 0) {
		return !!str && -1 != str.indexOf(subStr, start);
	}
	//截断
	static truncate = function (str, length, elipse = '...') {
		if (null == str) return '';
		length -= elipse.length;
		var res = str;
		if (res.length > length) {
			res = res.substr(0, length);
			if (/[^\s]/.test(str.charAt(length))) { //检查结尾空字符并扔掉
				res = StringUtils.trimRight(res.replace(/\w+$|\s+$/, ''));
			}
			res += elipse;
		}
		return res;
	}

	static upperCaseFirst = function (str) {
		return str ? str.substr(0, 1).toUpperCase() + str.substr(1) : str;
	}

	static countOf = function (str, subStr, exact = true) {
		if (null == str) return 0;
		subStr = StringUtils.escapePattern(subStr);
		var e = exact ? 'g' : 'ig';
		return str.match(new RegExp(subStr, e)).length;
	}

	static countWords = function (str) {
		return null == str ? 0 : str.match(/\b\w+\b/g).length;
	}

	static editDistance = function (pre = '', next = '') {
		var i;
		if (pre == next) return 0;
		var preNextCharDistance, j, f = [];
		const preLen = pre.length,
			nextLen = next.length;
		if (0 == preLen) return nextLen;
		if (0 == nextLen) return preLen;
		//generate matrix
		for (i = 0; i <= preLen; i++) {
			f[i] = [];
			f[i][0] = i;
		}
		for (j = 0; j <= nextLen; j++) {
			f[0][j] = j;
		}
		//f[i][j] = someValue distinct with i and j

		// the matrix describe the difference betwenn pre and next
		// if every pre != every next ,(eg. pre = "abc"  next = "defg") the distance equals to the sub length of two string
		// if any char in pre and next equals, the distance shall minus 1; 

		for (i = 1; i <= preLen; i++) {
			var preChar = pre.charAt(i - 1);
			for (j = 1; j <= nextLen; j++) {
				preNextCharDistance = preChar == next.charAt(j - 1) ? 0 : 1;
				f[i][j] = Math.min(
					f[i - 1][j] + 1, //left + 1 , most left : f[0][j] == j;
					f[i][j - 1] + 1, //top + 1,  most top : f[i][0] == i;
					f[i - 1][j - 1] + preNextCharDistance //left top + distance 
				);
			}
		}
		return f[preLen][nextLen];
	}

	static hasText = function (str) {
		return str && StringUtils.removeExtraWhitespace(str).length > 0;
	}

	static removeExtraWhitespace = function (str) {
		return null == str ? '' : StringUtils.trim(str).replace(/\s+/g, ' ');
	}

	static isEmpty = function (str) {
		return !str;
	}

	static isNumeric = function (str) {
		return null != str && /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?$/.test(str);
	}
	static quote = function (str) {
		return '"' + str.replace(/[\\"\r\n]/g, StringUtils._quote) + '"';
	}

	static _quote = function (char) {
		switch (char) {
			case '\\':
				return '\\\\';
			case '\r':
				return '\\r';
			case '\n':
				return '\\n';
			case '"':
				return '\\"';
			default:
				return '';
		}
	}

	static reverse = function (str) {
		return null == str ?
			'' :
			str.split('').reverse().join('');
	}
	static reverseWords = function (str) {
		return null == str ?
			'' :
			str.split(/\s+/).reverse().join(' ');
	}
	static similarity = function (pre, next) {
		var d = StringUtils.editDistance(pre, next),
			e = Math.max(pre.length, next.length);
		return 0 == e ? 100 : 100 * (1 - d / e);
	}

	static stripTags = function (str) {
		return null == str ?
			'' :
			str.replace(/<\/?[^>]+>/gim, '');
	}

	static swapCase = function (swapCase) {
		return null == swapCase ? '' : swapCase.replace(/(\w)/, StringUtils._swapCase);
	}

	static _swapCase = function (str) {
		const lower = str.toLowerCase(),
			upper = str.toUpperCase();
		switch (str) {
			case lower:
				return upper;
			case upper:
				return lower;
			default:
				return str;
		}
	}

	static removeWord = function (str, word, exact = true) {
		const regExp = new RegExp(`^${word}(\\W)|(\\W)${word}$|\\W${word}(?=\\W)`, exact ? 'g' : 'gi');
		return StringUtils.replace(regExp, '');
		// return StringUtils.replace(new RegExp('^' + word + '(\\W)|(\\W)' + word + '$|\\W' + word + '(?=\\W)', 'g' + (exact ? '' : 'i')), '');
	}

	static removeWords = function (str, words, exact = true) {
		words.forEach(word => StringUtils.removeWord(str, word, exact));
		// for (var e = words.length, f = 0; f < e; f++) str = StringUtils.removeWord(str, words[f], exact);
		return str;
	}

	static splitMultiSeperator = function (str, splitters, exact = false) {
		let ret = [str];
		for (var i = 0; i < splitters.length; i++) {
			ret = StringUtils.splitElements(ret, splitters[i], exact);
		}
		return ret;
	}

	static splitElements = function (str, splitter, exact = false) {
		let ret = [];
		let i, j;
		const len = str.length;
		for (i = 0; i < len; i++) {
			const arr = str[i].split(splitter);
			const arrLen = arr.length;
			for (j = 0; j < arrLen; j++) {
				var trimedArrItem = a.trim(arr[j]);
				if ('' != trimedArrItem) {
					const isLast = j < arrLen - 1;
					ret.push(exact && isLast ? trimedArrItem + splitter : trimedArrItem);
				}
			}
		}
		return ret;
	}

	static trimAll = function (strArr) {
		const len = strArr.length;
		for (var i = 0; i < len; i++) {
			strArr[i] = StringUtils.trimLeft(StringUtils.trimRight(strArr[i]));
		}
		return strArr;
	}

	static trimAllFilter = function (strArr) {
		const len = strArr.length;
		const ret = [];
		let i;
		for (i = 0; i < len; i++) {
			const e = StringUtils.trimLeft(StringUtils.trimRight(strArr[i]));
			'' != e && ret.push(e);
		}
		return ret;
	}

	static cleanSpecialChars = function (str) {
		const len = str.length;
		let ret = '';
		for (var i = 0; i < len; i++) {
			var code = str.charCodeAt(i);
			code < 47 || code > 57 && code < 65 || 95 == code ?
				ret += '-' :
				code > 90 && code < 97 || code > 122 && code < 128 ?
				ret += '-' :
				code > 127 ?
				code > 130 && code < 135 || 142 == code || 143 == code || 145 == code || 146 == code || 160 == code || 193 == code || 225 == code ?
				ret += 'a' :
				128 == code || 135 == code ?
				ret += 'c' :
				130 == code || code > 135 && code < 139 || 144 == code || 201 == code || 233 == code ?
				ret += 'e' :
				code > 138 && code < 142 || 161 == code || 205 == code || 237 == code ?
				ret += 'i' :
				164 == code || 165 == code ?
				ret += 'n' :
				code > 146 && code < 150 || 153 == code || 162 == code || 211 == code || 214 == code || 243 == code || 246 == code || 336 == code || 337 == code ?
				ret += 'o' :
				129 != code && 150 != code && 151 != code && 154 != code && 163 != code && 218 != code && 220 != code && 250 != code && 252 != code && 368 != code && 369 != code || (ret += 'u') :
				ret += str.charAt(i);
		}
		ret = ret.replace(/\-+/g, '-').replace(/\-*$/, '');
		return ret.toLowerCase();
	}

	static makeMultiline = function (str, c, splitter = ' ', breakLine = '\n') {
		const words = str.split(splitter);
		let g = 0;
		let newStr = '';
		for (var i = 0; i < words.length; i++) {
			if (g + words[i].length + splitter.length > c) {
				if (0 == newStr.length) {
					newStr = words[i]
				} else {
					newStr += breakLine + words[i]
				}
				g = 0;
			} else {
				if (0 == newStr.length) {
					newStr = words[i]
				} else {
					newStr += splitter + words[i]
				}
			}
		}
		return StringUtils.trimLeft(StringUtils.trimRight(newStr));
	}

	static uniqueID = function () {
		return (StringUtils._UID++).toString(36);
	};
}

export default StringUtils;
