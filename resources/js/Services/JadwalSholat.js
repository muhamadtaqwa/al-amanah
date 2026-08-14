export async function getJadwalSholat(tanggal) {
    const [tahun, bulan, hari] = tanggal.split("-");
    const res = await fetch(
        `https://api.aladhan.com/v1/timings/${hari}-${bulan}-${tahun}?latitude=-7.0333&longitude=110.3167&method=20`,
    );
    return res.json();
}
