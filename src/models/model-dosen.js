export class DosenRecord {
  constructor(data) {
    this.univ = data.univ || null;
    this.fullname = data.fullname || "Unknown";
    this.nama = data.nama || null;
    this.fakultas = data.fakultas || "Unassigned";
    this.prodi = data.prodi || null;
    this.foto = data.foto || null;
    this.link = data.link || null;
    this.email = data.email || null;
    this.jabatan = data.jabatan || null;

    this.gelarProf = data.gelarProf ? data.gelarProf.trim() : null;
    this.gelarDepan = data.gelarDepan ? data.gelarDepan.trim() : null;
    this.gelarBelakang = data.gelarBelakang ? data.gelarBelakang.trim() : null;

    this.id = this.generateId();
  }

  generateId() {
    const safeName = this.nama
      ? this.nama.replace(/[^a-zA-Z]/g, "").toLowerCase()
      : "unknown";

    const safeFakultas = this.fakultas
      ? this.fakultas.replace(/[^a-zA-Z]/g, "").toLowerCase()
      : "unassigned";

    const safeProdi = this.prodi
      ? this.prodi.replace(/[^a-zA-Z]/g, "").toLowerCase()
      : "unassigned";

    const univ = this.univ
      ? this.univ.replace(/[^a-zA-Z]/g, "").toLowerCase()
      : "unknown";

    return `dosen:${safeName}_${safeProdi}_${safeFakultas}_${univ}`;
  }
}
