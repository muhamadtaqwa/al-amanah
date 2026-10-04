const BASE_CDN = "https://cdn.jsdelivr.net/npm/sholawat-json@latest/sholawat";

// In-memory cache
const memoryCache = new Map();

export const LIST_KITAB = [
    {
        slug: "simtudduror",
        name: "Maulid Simtudduror",
        arabicName: "مَوْلِدُ سِمْطِ الدُّرَر",
        author: "Al-Habib Ali bin Muhammad Al-Habsyi",
        totalFasal: 17,
        mahalulQiyamFasal: 9,
        description:
            "Untaian mutiara kisah kelahiran dan kemuliaan akhlak Baginda Nabi Muhammad SAW.",
        badge: "Populer",
        gradient: "from-emerald-600 to-teal-800",
        accentColor: "#059669",
    },
    {
        slug: "diba",
        name: "Maulid Ad-Diba'i",
        arabicName: "مَوْلِدُ الدِّيْبَعِيّ",
        author: "Al-Imam Abdurrahman Ad-Diba'i",
        totalFasal: 29,
        mahalulQiyamFasal: 17,
        description:
            "Kitab maulid klasik karya Imam Abdurrahman Ad-Diba'i yang masyhur di pondok pesantren.",
        badge: "Tradisi Santri",
        gradient: "from-[#3D7ABA] to-[#1e3a8a]",
        accentColor: "#3D7ABA",
    },
    {
        slug: "burdah",
        name: "Qasidah Burdah",
        arabicName: "قَصِيْدَةُ الْبُرْدَة",
        author: "Al-Imam Syarafuddin Al-Bushiri",
        totalFasal: 10,
        mahalulQiyamFasal: null,
        description:
            "Untaian syiir pujian dan untaian mahabbah kepada Nabi SAW penggugah rindu.",
        badge: "10 Fasal",
        gradient: "from-amber-600 to-orange-800",
        accentColor: "#d97706",
    },
];

export const FASAL_TITLES = {
    simtudduror: [
        { no: 1, title: "Yâ rabbi shalli ‘alâ Muhammad…", isMahalulQiyam: false },
        { no: 2, title: "Alhamdulillahil qawiyyi sulthânuh", isMahalulQiyam: false },
        { no: 3, title: "Tajallal haqqu fî 'âlami qudsih", isMahalulQiyam: false },
        { no: 4, title: "Wa asyhadu an lâ ilâha illallâh...", isMahalulQiyam: false },
        { no: 5, title: "Ammâ ba‘du…", isMahalulQiyam: false },
        { no: 6, title: "Wa qad ânâ lil qalami…", isMahalulQiyam: false },
        { no: 7, title: "Wa mundzu ‘aliqat bihi ummuh…", isMahalulQiyam: false },
        { no: 8, title: "Faḫîna qaruba awânu wadh'ihi…", isMahalulQiyam: false },
        { no: 9, title: "⭐ Maḫallul Qiyâm (Yâ Nabî Salâm 'Alaik)", isMahalulQiyam: true },
        { no: 10, title: "Wa ḫîna baraza shallallâhu 'alaih…", isMahalulQiyam: false },
        { no: 11, title: "Tsumma innahû shallallah…", isMahalulQiyam: false },
        { no: 12, title: "Fanasya-a shallallâhu…", isMahalulQiyam: false },
        { no: 13, title: "Tsumma innahû ba‘da mâ…", isMahalulQiyam: false },
        { no: 14, title: "Wa minasy syarafi…", isMahalulQiyam: false },
        { no: 15, title: "Wa ḫaitsu tasyarrafatil asmâ‘u…", isMahalulQiyam: false },
        { no: 16, title: "Wa laqadit tashafa shallallâhu 'alaih…", isMahalulQiyam: false },
        { no: 17, title: "Doa Penutup Maulid Simthud Durar", isMahalulQiyam: false },
    ],
    diba: [
        { no: 1, title: "Niat dan Hadiah Fatihah", isMahalulQiyam: false },
        { no: 2, title: "Ya Rabbi Shalli", isMahalulQiyam: false },
        { no: 3, title: "Ya Rasûlallâh Salamun 'Alaik", isMahalulQiyam: false },
        { no: 4, title: "Innâ fataḫnâ laka fathan mubînâ", isMahalulQiyam: false },
        { no: 5, title: "Al-ḫamdulillâhil qawiyyi ghâlib", isMahalulQiyam: false },
        { no: 6, title: "Qîla huwa âdam", isMahalulQiyam: false },
        { no: 7, title: "Yub‘atsu min tihâmah", isMahalulQiyam: false },
        { no: 8, title: "Tsumma ardudduhu", isMahalulQiyam: false },
        { no: 9, title: "Shalâtullâhi mâ lâhat kawâkib", isMahalulQiyam: false },
        { no: 10, title: "Fasubḫânaman khashshahû", isMahalulQiyam: false },
        { no: 11, title: "Awwalu mâ nastaftiḫu", isMahalulQiyam: false },
        { no: 12, title: "Al-ḫadîtsul awwal", isMahalulQiyam: false },
        { no: 13, title: "Al-hadîtsuts tsânî", isMahalulQiyam: false },
        { no: 14, title: "Fayaqûlul haqqu", isMahalulQiyam: false },
        { no: 15, title: "Aḫdlirû qulûbakum yâ ma'syaral mu'minîn", isMahalulQiyam: false },
        { no: 16, title: "Fahtazzal 'arsyu tharaban", isMahalulQiyam: false },
        { no: 17, title: "⭐ Mahallul Qiyâm (Yâ Nabî Salâm 'Alaik)", isMahalulQiyam: true },
        { no: 18, title: "Wawulida shallallâhu 'alaih", isMahalulQiyam: false },
        { no: 19, title: "Qîla man yakfulu hâdzal yatîm", isMahalulQiyam: false },
        { no: 20, title: "Tsumma a‘radla 'anhu marâdli'", isMahalulQiyam: false },
        { no: 21, title: "Fabainamal habîbu sallallâhu 'alaih", isMahalulQiyam: false },
        { no: 22, title: "Faqâlatil malâikatu yâ habîbar rahmân", isMahalulQiyam: false },
        { no: 23, title: "Fabainamal habîbu fî syabâbih", isMahalulQiyam: false },
        { no: 24, title: "Falammâ ra’athu ḫalîmatu sâliman", isMahalulQiyam: false },
        { no: 25, title: "Wa kâna ahsanan nâsi khalqan", isMahalulQiyam: false },
        { no: 26, title: "Wa qîla liba‘dlihim tasifahu", isMahalulQiyam: false },
        { no: 27, title: "Wa mâ ‘asâ an yuqâla", isMahalulQiyam: false },
        { no: 28, title: "Ya badratimmin hâza kulla kamâli", isMahalulQiyam: false },
        { no: 29, title: "Doa Penutup Maulid ad-Diba’i", isMahalulQiyam: false },
    ],
    burdah: [
        { no: 1, title: "Fasal 1: Rindu dan Kasih Nabi (الغزل وشكوى الغرام)", isMahalulQiyam: false },
        { no: 2, title: "Fasal 2: Bahaya Hawa Nafsu (التحذير من هوى النفس)", isMahalulQiyam: false },
        { no: 3, title: "Fasal 3: Pujian Rasulullah (مدح سيد المرسلين)", isMahalulQiyam: false },
        { no: 4, title: "Fasal 4: Kelahiran Nabi (في مولده الشريف)", isMahalulQiyam: false },
        { no: 5, title: "Fasal 5: Mukjizat Nabi (في معجزاته الباهرة)", isMahalulQiyam: false },
        { no: 6, title: "Fasal 6: Kemuliaan Al-Qur'an (في شـرف الــقرآن)", isMahalulQiyam: false },
        { no: 7, title: "Fasal 7: Isra' dan Mi'raj (في إسرائه ومعراجه)", isMahalulQiyam: false },
        { no: 8, title: "Fasal 8: Perjuangan Nabi (في جهاد النبي)", isMahalulQiyam: false },
        { no: 9, title: "Fasal 9: Tawassul Kepada Nabi (في التوسل بالنّبي)", isMahalulQiyam: false },
        { no: 10, title: "Fasal 10: Munajat & Doa (المُنَاجَاةِ وَعَرَضُ الحَاجَاتِ)", isMahalulQiyam: false },
    ],
};

/**
 * Fetch and normalize a single fasal
 */
export async function getFasal(kitabSlug, fasalNumber, signal) {
    const cacheKey = `maulid_${kitabSlug}_${fasalNumber}`;

    // 1. Check in-memory cache
    if (memoryCache.has(cacheKey)) {
        return memoryCache.get(cacheKey);
    }

    // 2. Check localStorage cache
    try {
        const local = localStorage.getItem(cacheKey);
        if (local) {
            const parsed = JSON.parse(local);
            memoryCache.set(cacheKey, parsed);
            return parsed;
        }
    } catch (e) {
        // Ignore localStorage error
    }

    // 3. Fetch from Public CDN API
    const url = `${BASE_CDN}/${kitabSlug}/nu_online/fasl/${fasalNumber}.json`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
        throw new Error(`Gagal memuat fasal ${fasalNumber} (Status ${res.status})`);
    }

    const raw = await res.json();

    // 4. Normalize data structure
    const rawSections = raw.sections || {};
    const sectionsArray = Object.keys(rawSections)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => {
            const sec = rawSections[k];
            const rawTexts = sec.text || {};
            const textsArray = Object.keys(rawTexts)
                .sort((a, b) => Number(a) - Number(b))
                .map((tk) => {
                    const item = rawTexts[tk];
                    return {
                        arabic: item.arabic || "",
                        latin: item.latin || "",
                        translation: item.translation || item.terjemah || "",
                    };
                });

            return {
                name: sec.name || "",
                type: sec.type || "rawi",
                texts: textsArray,
            };
        });

    const normalized = {
        number: Number(raw.number || fasalNumber),
        name: raw.name || "",
        latin: raw.latin || "",
        source: raw.source || "nu-online",
        sections: sectionsArray,
    };

    // Store in cache
    memoryCache.set(cacheKey, normalized);
    try {
        localStorage.setItem(cacheKey, JSON.stringify(normalized));
    } catch (e) {
        // Storage might be full
    }

    return normalized;
}
