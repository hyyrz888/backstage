//防抖函数
export function debounce(func, delay) {
	let delays = delay || 500,
		timer = null;
	return function(...args) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, delays)
	}
}

//格式化时间
export function formatDate(date, fmt) {

	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	let o = {
		'M+': date.getMonth() + 1,
		"d+": date.getDate(),
		"h+": date.getHours(),
		"m+": date.getMinutes(),
		"s+": date.getSeconds()
	};

	for (let k in o) {
		// console.log(`(${k})`);
		// (M+)
		// (d+)
		// (h+)
		// (m+)
		// (s+)
		if (new RegExp(`(${k})`).test(fmt)) {
			let str = o[k] + "";
			//yyyy-MM-dd  如果只传入一个字母  比如h:m:s  那么直接直接用o[k]
			fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padleftZero(str));
		}
	}
	return fmt;
}

function padleftZero(str) {
	return ('00' + str).substr(str.length);
}


//正则手机验证 正则邮箱验证

export const RegObject = {
	Email: {
		regStr: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
		msg: '邮箱格式不正确'
	},
	Mobile: {
		regStr: /^1(3|4|5|6|7|8|9)\d{9}$/,
		msg: '手机格式不正确'
	}
}
