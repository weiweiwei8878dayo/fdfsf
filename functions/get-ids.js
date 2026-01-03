const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
    const headers = { "Access-Control-Allow-Origin": "*" };
    const pw = event.queryStringParameters.pw;

    // パスワードチェック
    if (pw !== 'weiweiwei8878') {
        return { statusCode: 403, headers, body: "Forbidden" };
    }

    try {
        const store = getStore("daikou_data");
        // 全データをリストアップ
        const { blobs } = await store.list();
        
        // 各データを取得して配列にまとめる
        const results = await Promise.all(
            blobs.map(async (b) => await store.get(b.key, { type: "json" }))
        );

        // 日付順にソート（新しい順）
        const sorted = results.filter(d => d !== null).sort((a, b) => 
            new Date(b.lastUpdate || 0) - new Date(a.lastUpdate || 0)
        );

        return { statusCode: 200, headers, body: JSON.stringify(sorted) };
    } catch (err) {
        return { statusCode: 502, headers, body: err.message };
    }
};
