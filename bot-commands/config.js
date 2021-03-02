const core = require('@actions/core');

exports.getConfig = async (client, owner, repo) => {
    config_file_path = core.getInput('config-path');

    const {status, data: {content: config_data_encoded}} = await client.repos.getContent({
        owner,
        repo,
        path: config_file_path
    });

    if (status !== 200) {
        throw new Error(`Received unexpected API status code while requsting config ${status}`);
    }

    const config_data = Buffer.from(config_data_encoded, 'base64').toString('utf-8');
    const config_data_json = JSON.parse(config_data);

    return config_data_json;
}