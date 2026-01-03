const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        // orderId を追加
        const { userId, userName, status, lastUpdate, item, amount, banOption, ssUrl, orderId } = data;

        const REPO_OWNER = "weiweiwei8878dayo";
        const REPO_NAME = "fdfsf";
        const FILE_PATH = "db.json";
        const BRANCH = "main";
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 

        if (!GITHUB_TOKEN) return { statusCode: 500, body: "GitHub Token error" };

        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

        const getRes = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
        if (!getRes.ok) throw new Error("Fetch db.json failed");
        
        const fileData = await getRes.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        let json = JSON.parse(content);

        const index = json.findIndex(entry => entry.userId === userId);
        
        const currentSS = (ssUrl !== undefined && ssUrl !== null) 
            ? ssUrl 
            : (index !== -1 ? json[index].ssUrl : "-");

        // 既存の注文IDがあれば維持、新規なら保存
        const currentOrderId = orderId || (index !== -1 ? json[index].orderId : null);

        const newEntry = {
            userId,
            userName,
            status,
            lastUpdate,
            item: item || (index !== -1 ? json[index].item : "-"),
            amount: amount || (index !== -1 ? json[index].amount : 0),
            banOption: banOption || (index !== -1 ? json[index].banOption : "-"),
            ssUrl: currentSS,
            orderId: currentOrderId
        };

        if (index !== -1) {
            json[index] = { ...json[index], ...newEntry };
        } else {
            json.push(newEntry);
        }

        const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');
        await fetch(url, {
            method: 'PUT',
            headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: `Update ${userName}`, content: updatedContent, sha: fileData.sha, branch: BRANCH })
        });

        return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };
    } catch (error) {
        return { statusCode: 500, body: error.message };
    }
};
