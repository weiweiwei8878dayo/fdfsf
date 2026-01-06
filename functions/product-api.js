const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const REPO_OWNER = "weiweiwei8878dayo";
        const REPO_NAME = "fdfsf";
        const FILE_PATH = "products.json";
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const ADMIN_PASS = process.env.ADMIN_PASSWORD;

        if (!GITHUB_TOKEN) return { statusCode: 500, body: "Token Error" };

        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

        // GET: 商品リストを取得
        if (event.httpMethod === 'GET') {
            const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
            if (!res.ok) throw new Error("Fetch Failed");
            const fileData = await res.json();
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            return { statusCode: 200, body: content };
        }

        // POST: 商品リストを保存
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            
            // パスワード認証
            if (body.password !== ADMIN_PASS) {
                return { statusCode: 401, body: "Unauthorized" };
            }

            // 現在のファイル情報を取得(SHAが必要なため)
            const getRes = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
            const fileData = await getRes.json();

            // 更新処理
            const newContent = Buffer.from(JSON.stringify(body.products, null, 2)).toString('base64');
            await fetch(url, {
                method: 'PUT',
                headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: "Update products",
                    content: newContent,
                    sha: fileData.sha
                })
            });
            return { statusCode: 200, body: "Success" };
        }

        return { statusCode: 405, body: "Method Not Allowed" };

    } catch (error) {
        // ファイルがない場合の初期値
        if (event.httpMethod === 'GET') {
            return { statusCode: 200, body: JSON.stringify({ nyanko: [], tsumu: [] }) };
        }
        return { statusCode: 500, body: error.message };
    }
};
