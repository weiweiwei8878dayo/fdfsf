const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    // ⚠️【ここを必ず変更】Bot側と一文字一句同じにしてください
    const ADMIN_PASSWORD = "yudai2011"; 
    
    // URLの ?pw=xxx から取得
    const queryPw = event.queryStringParameters.pw;

    console.log("Received PW:", queryPw); // デバッグ用

    if (!queryPw || queryPw !== ADMIN_PASSWORD) {
        return { 
            statusCode: 403, 
            body: JSON.stringify({ error: "パスワードが正しくありません" }),
            headers: { "Content-Type": "application/json" }
        };
    }

    try {
        const store = getStore("customer_ids");
        const list = await store.get("list", { type: "json" }) || [];
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify(list)
        };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: "サーバーエラー" }) };
    }
};
