// Halaman mushaf
export async function getHalamanMushaf(nomorHalaman) {
    const res = await fetch(
        `https://api.quran.com/api/v4/quran/verses/uthmani?page_number=${nomorHalaman}`,
    );
    return res.json();
}

// List surat
export async function getListSurat() {
    const res = await fetch(
        "https://api.quran.com/api/v4/chapters?language=id",
    );
    return res.json();
}

// List juz
export async function getListJuz() {
    const res = await fetch("https://api.quran.com/api/v4/juzs");
    return res.json();
}

// Cari halaman dari surat
export async function getHalamanDariSurat(nomorSurat) {
    const res = await fetch(
        `https://api.quran.com/api/v4/chapters/${nomorSurat}?language=id`,
    );
    return res.json();
}

// Cari halaman dari ayat
export async function getHalamanDariAyat(nomorSurat, nomorAyat) {
    const res = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${nomorSurat}:${nomorAyat}?language=id`,
    );
    return res.json();
}
