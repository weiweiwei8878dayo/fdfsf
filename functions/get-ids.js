const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    const ADMIN_PASSWORD = "yudai2011";
    const queryPw = event.queryStringParameters.pw;

    // 1. パスワードチェック
    if (queryPw !== ADMIN_PASSWORD) {
        return { 
            statusCode: 403, 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Forbidden" }) 
        };
    }

    try {
        // 2. ストアの取得
        // 手動デプロイの場合、明示的に名前を指定する必要があります
        const store = getStore("customer_ids");
        
        // 3. データの取得（存在しない場合はnullが返る）
        const list = await store.get("list", { type: "json" });

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            // リストが空（null/undefined）なら空配列 [] を返す
            body: JSON.stringify(list || [])
        };
    } catch (e) {
        // 500エラーの詳細をブラウザに書き出す
        console.error("Blob Error:", e);
        return { 
            statusCode: 500, 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                error: "Internal Server Error", 
                message: e.message,
                details: "Netlify Blobs might not be enabled for this site."
            }) 
        };
    }
};
