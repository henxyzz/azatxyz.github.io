const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Fungsi untuk mengambil detail plugin
async function bukkitDetail(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const project = {};

        project.title = $('.project-title a span').text();
        project.avatarUrl = $('.avatar-wrapper a img').attr('src');
        project.category = $('.RootGameCategory a').text();
        project.downloadLink = "https://dev.bukkit.org" + $('.button.alt.fa-icon-download').attr('href');
        project.overviewLink = "https://dev.bukkit.org" + $('.e-header-nav .e-menu li.e-selected a').attr('href');
        project.fileLink = "https://dev.bukkit.org" + $('.e-header-nav a[href*="files"]').attr('href');
        project.imageLink = "https://dev.bukkit.org" + $('.e-header-nav a[href*="images"]').attr('href');
        project.issuesLink = $('.e-header-nav a.external-link').attr('href');
        project.dependenciesLink = "https://dev.bukkit.org" + $('.e-header-nav a[href*="relations/dependencies"]').attr('href');
        project.dependentsLink = "https://dev.bukkit.org" + $('.e-header-nav a[href*="relations/dependents"]').attr('href');
        project.totalDownloads = $('.info-label:contains("Total Downloads")').next('.info-data').text();
        project.owner = $('.project-members .owner span').text();
        project.ownerProfileLink = "https://dev.bukkit.org" + $('.project-members .owner a').attr('href');
        project.description = $('.project-description').text().trim();
        project.features = [];
        $('.project-description h3:contains("Features")').next('ul').find('li').each((i, el) => {
            project.features.push($(el).text());
        });
        project.upgradingInstructions = [];
        $('.project-description h3:contains("Upgrading to 2.0")').next('ol').find('li').each((i, el) => {
            project.upgradingInstructions.push($(el).text());
        });
        project.recentFiles = [];
        $('.cf-recentfiles .file-tag').each((i, el) => {
            const file = {
                name: $(el).find('.project-file-name-container a').text(),
                downloadLink: "https://dev.bukkit.org" + $(el).find('.project-file-download-button a').attr('href'),
                releaseDate: $(el).find('abbr').attr('title')
            };
            project.recentFiles.push(file);
        });
        project.devBuildsLink = "https://dev.bukkit.org" + $('.project-description:contains("Dev Builds") a').attr('href');

        return project;
    } catch (error) {
        throw new Error('Error scraping plugin details: ' + error.message);
    }
}

// Fungsi untuk mengambil plugin populer
async function bukkitPopuler() {
    try {
        const { data } = await axios.get('https://dev.bukkit.org/bukkit-plugins?page=1');
        const $ = cheerio.load(data);
        const plugins = [];

        $('li.project-list-item').each((index, element) => {
            const name = $(element).find('.info.name .name-wrapper a').text();
            const author = $(element).find('.info.name .byline a').text();
            const downloads = $(element).find('.info.stats .e-download-count').text();
            const updateDate = $(element).find('.info.stats .e-update-date abbr').attr('title');
            const description = $(element).find('.description p').text();
            const imageUrl = $(element).find('.avatar img').attr('src');
            const projectUrl = $(element).find('.avatar a').attr('href');
            const categories = [];

            $(element).find('.categories-box .category-icons a').each((i, catElement) => {
                const categoryTitle = $(catElement).attr('title');
                categories.push(categoryTitle);
            });

            const plugin = {
                name,
                author,
                downloads,
                updateDate,
                description,
                imageUrl,
                projectUrl,
                categories
            };

            plugins.push(plugin);
        });

        return plugins;
    } catch (error) {
        throw new Error('Error fetching popular plugins: ' + error.message);
    }
}

// Fungsi pencarian plugin
async function bukkitSearch(keyword) {
    try {
        const { data } = await axios.get('https://dev.bukkit.org/search?search=' + keyword);
        const $ = cheerio.load(data);
        const plugins = [];

        $('tr.results').each((index, element) => {
            const plugin = {
                imageUrl: $(element).find('.results-image img').attr('src'),
                name: $(element).find('.results-name a').text(),
                summary: $(element).find('.results-summary').text().trim(),
                owner: $(element).find('.results-owner a').text(),
                ownerProfileLink: "https://dev.bukkit.org" + $(element).find('.results-owner a').attr('href'),
                date: $(element).find('.results-date abbr').attr('title') || 'N/A',
                projectLink: "https://dev.bukkit.org" + $(element).find('.results-name a').attr('href')
            };

            plugins.push(plugin);
        });

        return plugins;
    } catch (error) {
        throw new Error('Error searching for plugins: ' + error.message);
    }
}

// Rute utama untuk menangani request berdasarkan parameter "mode"
router.get('/', async (req, res) => {
    const { mode, url, keyword } = req.query;

    if (!mode) {
        return res.status(400).json({
            success: false,
            message: 'Parameter "mode" wajib diisi. Pilih antara "detail", "populer", atau "search".'
        });
    }

    try {
        if (mode === 'detail') {
            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter "url" tidak ditemukan. Silakan masukkan URL plugin yang valid.'
                });
            }
            const project = await bukkitDetail(url);
            return res.json({
                success: true,
                project
            });
        }

        if (mode === 'populer') {
            const plugins = await bukkitPopuler();
            return res.json({
                success: true,
                plugins
            });
        }

        if (mode === 'search') {
            if (!keyword) {
                return res.status(400).json({
                    success: false,
                    message: 'Parameter "keyword" tidak ditemukan. Silakan masukkan kata kunci untuk pencarian plugin.'
                });
            }
            const plugins = await bukkitSearch(keyword);
            return res.json({
                success: true,
                plugins
            });
        }

        // Jika mode tidak dikenali
        return res.status(404).json({
            success: false,
            message: 'Mode tidak ditemukan. Pilih antara "detail", "populer", atau "search".'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;