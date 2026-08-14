export async function getListSurat() {
    const res = await fetch("https://equran.id/api/v2/surat");
    return res.json();
}

export async function getDetailSurat(nomor) {
    const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
    return res.json();
}
