const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const REPO_OWNER = "weiweiwei8878dayo";
        const REPO_NAME = "fdfsf";
        const FILE_PATH = "db.json";
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const ADMIN_PASS = process.env.ADMIN_PASSWORD;

        const { id, pw } = event.queryStringParameters || {};

        if (!GITHUB_TOKEN) return { statusCode: 500, body: "Server Error: No Token" };

        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
        
        if (!res.ok) throw new Error("GitHub Fetch Failed");
        
        const fileData = await res.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const json = JSON.parse(content);

        // 1. 管理者: 全データを返す
        if (pw === ADMIN_PASS) {
            return { statusCode: 200, body: JSON.stringify(json) };
        }

        // 2. ✨ 修正: 待ち人数カウントロジック
        if (id === 'queue_count') {
            // 「完了」でも「キャンセル」でもないものを全てカウントする
            // これなら「保留中」「支払い確認待ち」「作業中」すべて含まれます
            const activeCount = json.filter(entry => 
                !entry.status.includes('完了') &&
                !entry.status.includes('キャンセル')
            ).length;
            
            return { statusCode: 200, body: JSON.stringify({ count: activeCount }) };
        }

        // 3. 一般ユーザー: 自分のIDのデータだけ返す
        if (id) {
            const userData = json.find(entry => entry.userId === id);
            if (userData) {
                return { statusCode: 200, body: JSON.stringify([userDat
