const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const router = express.Router();

const links = {
    glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    writetext: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
    advancedglow: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
    logomaker: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
    pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
    neonglitch: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
    flagtext: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
    flag3dtext: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
    deletingtext: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
    sandsummer: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
    makingneon: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
    royaltext: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html'
};

const createEffect = async (command, text) => {
    const url = links[command];
    if (!url) throw new Error('Command tidak valid.');

    let form = new FormData();
    let gT = await axios.get(url, {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
        }
    });
    let $ = cheerio.load(gT.data);
    let token = $("input[name=token]").val();
    let build_server = $("input[name=build_server]").val();
    let build_server_id = $("input[name=build_server_id]").val();
    form.append("text[]", text);
    form.append("token", token);
    form.append("build_server", build_server);
    form.append("build_server_id", build_server_id);

    let res = await axios.post(url, form, {
        headers: {
            Accept: "*/*",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
            cookie: gT.headers["set-cookie"]?.join("; "),
            ...form.getHeaders()
        }
    });
    let $$ = cheerio.load(res.data);
    let json = JSON.parse($$("input[name=form_value_input]").val());
    json["text[]"] = json.text;
    delete json.text;

    let { data } = await axios.post("https://en.ephoto360.com/effect/create-image", new URLSearchParams(json), {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
            cookie: gT.headers["set-cookie"].join("; ")
        }
    });
    return build_server + data.image;
};

router.get('/', async (req, res) => {
    const { command, text } = req.query;

    if (!command || !text) {
        return res.status(400).json({
            status: 'error',
            message: 'Parameter tidak valid. Gunakan format: /ephoto?command=<command>&text=<text>',
            commands: Object.keys(links)
        });
    }

    if (!links[command]) {
        return res.status(400).json({
            status: 'error',
            message: `Command '${command}' tidak ditemukan. Berikut daftar command yang tersedia:`,
            commands: Object.keys(links)
        });
    }

    try {
        const imageUrl = await createEffect(command, text);
        res.json({
            status: 'success',
            command,
            text,
            image: imageUrl
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Gagal membuat efek gambar.',
            error: error.message
        });
    }
});

module.exports = router;