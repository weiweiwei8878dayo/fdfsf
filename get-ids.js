const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    // 1. パスワード判定
    const ADMIN_PASSWORD = "yudai2011"; 
    const queryPw = event.queryStringParameters.pw;

    if (!queryPw || queryPw !== ADMIN_PASSWORD) {
        return { 
            statusCode: 403, 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Forbidden" }) 
        };
    }

    try {
        // 2. Blobからデータを取得
        // ※ Store名を Bot側と同じ "customer_ids" に固定します
        const store = getStore("customer_ids");
        const list = await store.get("list", { type: "json" });
        
        // データが空（まだ誰も依頼していない）の場合は空配列を返す
        const data = list || [];

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // ブラウザからのアクセスを許可
            },
            body: JSON.stringify(data)
        };
    } catch (e) {
        // エラー内容を画面に返す（デバッグ用）
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: e.message }) 
        };
    }
};
