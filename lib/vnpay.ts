import crypto from 'crypto';

export function sortObject(obj: any) {
	let sorted: any = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export function createVNPayUrl({
    amount,
    ipAddr,
    orderId,
    orderInfo,
    returnUrl,
    tmnCode,
    secretKey,
    vnpUrl
}: {
    amount: number;
    ipAddr: string;
    orderId: string;
    orderInfo: string;
    returnUrl: string;
    tmnCode: string;
    secretKey: string;
    vnpUrl: string;
}) {
    let date = new Date();
    let createDate = date.getFullYear().toString() + 
        (date.getMonth() + 1).toString().padStart(2, '0') + 
        date.getDate().toString().padStart(2, '0') + 
        date.getHours().toString().padStart(2, '0') + 
        date.getMinutes().toString().padStart(2, '0') + 
        date.getSeconds().toString().padStart(2, '0');

    let vnp_Params: any = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': tmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': orderId,
        'vnp_OrderInfo': orderInfo,
        'vnp_OrderType': 'other',
        'vnp_Amount': amount * 100,
        'vnp_ReturnUrl': returnUrl,
        'vnp_IpAddr': ipAddr,
        'vnp_CreateDate': createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    let querystring = Object.keys(vnp_Params)
        .map(key => key + '=' + vnp_Params[key])
        .join('&');

    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(querystring, 'utf-8')).digest("hex");
    
    return vnpUrl + "?" + querystring + "&vnp_SecureHash=" + signed;
}

export function verifyVNPaySignature(params: any, secretKey: string) {
    let vnp_SecureHash = params['vnp_SecureHash'];

    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    let sortedParams = sortObject(params);
    let querystring = Object.keys(sortedParams)
        .map(key => key + '=' + sortedParams[key])
        .join('&');

    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(querystring, 'utf-8')).digest("hex");

    return vnp_SecureHash === signed;
}
