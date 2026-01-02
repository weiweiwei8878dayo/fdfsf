const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    // あなたが設定するパスワード
    const ADMIN_PASSWORD = "yudai2011"; 
    
    const queryPw = event.queryStringParameters.pw;

    // パスワードチェック
    if (queryPw !== ADMIN_PASSWORD) {
        return { statusCode: 403, body: "Forbidden" };
    }

    // 認証成功時のみデータを取得して返す
    try {
        const store = getStore("customer_ids");
        const list = await store.get("list", { type: "json" }) || [];
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(list)
        };
    } catch (e) {
        return { statusCode: 500, body: "Error" };
    }
};
