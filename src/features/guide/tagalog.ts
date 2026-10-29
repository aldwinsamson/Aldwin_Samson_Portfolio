/**
 * Tagalog / Filipino / Taglish support for the portfolio assistant.
 *
 * The assistant understands a Filipino question by translating it into the English words the site's
 * content is written in ("Marunong ba siya mag-Terraform?" → "… terraform"), then searching as usual.
 * Everything here is plain data + regular expressions — add a word to WORDS any time the assistant
 * misses one.
 */

import type { Lang } from "@/content/knowledge";

export type { Lang };

/** Filipino function words that carry no meaning for the search. */
export const TL_STOPWORDS: string[] = (
  "ang ng nang sa mga si sina ni nina kay kina ay at ba po ho opo oo hindi di wala walang may mayroon meron na pa pala naman kasi nga lang lamang din rin daw raw " +
  "yung yong ung iyong iyon iyan ito nito niyan noon dito diyan doon dyan dun siya sila kami kayo tayo ako ikaw ka mo ko niya nila namin natin ninyo nyo " +
  "kanya kaniya kanyang kaniyang siyang niyang syang pero ngunit kung kapag habang para dahil upang mula hanggang gusto nais pwede puwede maaari paki pakiusap sana talaga " +
  "masyado sobra medyo kaya bale eh uh ah hay ayun ayan ayon heto narito andito sige muna tungkol patungkol hinggil ukol mag nag pag pinag naka maka magka lahat pinaka " +
  "alam marunong anong ilang alin kanino sabihin ikuwento ikwento kwento magkuwento ipakilala ilarawan nya sya yan yun dyan ganun ganon ganyan simpleng salita paraan"
).split(/\s+/);

/** Filipino → the English words used on the site. A word can expand to several English words. */
const WORDS: Record<string, string> = {
  // question words
  pano: "how", san: "where", bat: "why", gaano: "how", katagal: "long", kelan: "when", sino: "who", ano: "what", anu: "what", anuano: "what", anuanong: "what", saan: "where", nasaan: "where", kailan: "when", paano: "how", bakit: "why", magkano: "how much", ilan: "how many",
  // work & experience
  trabaho: "work job experience", nagtrabaho: "worked experience", nagtatrabaho: "work", nakapagtrabaho: "worked experience", pinagtrabahuhan: "worked company experience",
  pinagtatrabahuhan: "worked company experience", trabahuhan: "company", kumpanya: "company", kompanya: "company", karanasan: "experience", hanapbuhay: "job",
  // projects
  proyekto: "project", gawa: "did", ginawa: "did", nagawa: "did", ginagawa: "did", gumawa: "did", binuo: "built", nabuo: "built", lumikha: "built", nilikha: "built", nagbuo: "built", paggawa: "building",
  // skills & tools
  kasanayan: "skill", kakayahan: "skill", kaalaman: "skill", talento: "skill", galing: "skill", husay: "skill", abilidad: "skill", kagalingan: "skill",
  teknolohiya: "technology", kasangkapan: "tool", kagamitan: "tool", gamit: "use", gumagamit: "use", ginagamit: "use", ginamit: "use", gumamit: "use", nakagamit: "use",
  espesyalidad: "specialty", espesyalisasyon: "specialty", lakas: "strengths", kalakasan: "strengths",
  // certificates & awards
  sertipiko: "certification", sertipikasyon: "certification", sertipikado: "certification", pagsasanay: "training", seminar: "training",
  parangal: "award won", gantimpala: "award won", karangalan: "award won", premyo: "award won", panalo: "award won", nanalo: "award won", napanalunan: "award won", napanalo: "award won",
  // education
  paaralan: "school university", eskwela: "school university", eskuwela: "school university", eskwelahan: "school university", pamantasan: "university",
  unibersidad: "university", kolehiyo: "college university", edukasyon: "education", natapos: "graduated", nagtapos: "graduated", nakapagtapos: "graduated",
  kurso: "degree course", digri: "degree", pinagaralan: "studied school university", nagaral: "studied school university", aral: "study school",
  // contact & availability
  kontak: "contact", makontak: "contact", makokontak: "contact", makontakin: "contact", ugnayan: "contact", makausap: "contact", makakausap: "contact", kausapin: "contact",
  abutin: "contact", maabot: "contact", mensahe: "contact message", imeyl: "email", tawagan: "phone", tumawag: "phone",
  bakante: "available", magagamit: "available", bukas: "open", naghahanap: "looking", hanap: "looking", oportunidad: "opportunity", opurtunidad: "opportunity", alok: "offer",
  upahan: "hire", kunin: "hire", tanggapin: "hire", piliin: "hire", pumili: "hire",
  // challenges, results, team
  hamon: "challenge", kahirapan: "challenge", problema: "challenge", suliranin: "challenge", balakid: "challenge", pagsubok: "challenge", hirap: "challenge",
  resulta: "outcome result", kinalabasan: "outcome result", kinahinatnan: "outcome result", koponan: "team", pangkat: "team", grupo: "team",
  lider: "team leader led", pinuno: "team leader led", namuno: "team leader led", nanguna: "team leader led",
  // misc
  magaling: "good", mahusay: "good", eksperto: "expert", bihasa: "skilled",
  pangunahing: "", pangunahin: "", mahalagang: "", importanteng: "",
  tesis: "thesis", wika: "language", pangalan: "name", paliwanag: "explain meaning", ipaliwanag: "explain meaning", kahulugan: "meaning", dagdag: "more", karagdagan: "more",
  lokasyon: "location", lugar: "location", nakatira: "live based location", tumitira: "live based location", tumira: "live based location", nakabase: "based location", taga: "from based location",
  // private topics (routed to "contact John personally")
  numero: "phone", telepono: "phone", selpon: "phone", cellphone: "phone", cp: "phone", sweldo: "salary", suweldo: "salary", sahod: "salary", kinikita: "salary", bayad: "salary",
  edad: "age", kaarawan: "birthday", tirahan: "home address", bahay: "home address", pamilya: "family", magulang: "family", kapatid: "family", asawa: "family relationship",
  anak: "family", nobya: "relationship", nobyo: "relationship", kasintahan: "relationship", kasal: "married", relihiyon: "religion", pulitika: "politics", kalusugan: "health",
};

/** More everyday Filipino / Taglish words (kept apart so the list above stays readable). */
Object.assign(WORDS, {
  // people & roles
  kasama: "team", kasamahan: "team", katrabaho: "team", katuwang: "team", kagrupo: "team", kasamang: "team",
  tungkulin: "role responsibilities", papel: "role", posisyon: "role position", gampanin: "role responsibilities", ginagampanan: "role", responsibilidad: "responsibilities",
  dalubhasa: "expert specialty", espesyalista: "specialist specialty",
  // learning & doing
  natutunan: "learned gained", natutuhan: "learned gained", inaral: "studied", pinagaralan: "studied school university", sinulat: "wrote", isinulat: "wrote", sinusulat: "wrote",
  gawain: "work did", gumagana: "works", paggana: "works", sistema: "system", aplikasyon: "application app", programa: "program",
  // time words
  bago: "new", pinakabago: "latest", pinakahuli: "latest", pinakahuling: "latest", huling: "last", kasalukuyan: "current", kasalukuyang: "current", ngayon: "now",
  taon: "year", buwan: "month", linggo: "week", matagal: "long", katagalan: "long", tagal: "long", simula: "start", umpisa: "start", wakas: "end",
  // counting & comparing
  ilang: "how many", pagkakaiba: "difference", magkaiba: "difference", kumpara: "compare", ikumpara: "compare", paghambingin: "compare", hambing: "compare", versus: "versus",
  // misc
  wikang: "language", lenggwahe: "language", salita: "", sinong: "who", alin: "which", kanino: "whose",
  hilig: "interest hobby", libangan: "hobby", interes: "interest", paborito: "favorite", pinakagusto: "favorite",
  mahirap: "hard challenge", pinakamahirap: "hardest challenge", nahirapan: "challenge hard", natapos: "graduated finished",
  ipinakita: "show", ipakita: "show", ibahagi: "share", detalye: "details", impormasyon: "information", karagdagang: "more",
  proyekto: "project", proyektong: "project", mga: "",
  pinakamalaki: "achievement award", pinakamataas: "highest", makikita: "find link", mahahanap: "find link", mababasa: "find read", mapapanood: "find demo video",
});

/** Small edit-distance helper (adjacent swaps count as one edit), used to forgive typos in Filipino words. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

const WORD_KEYS = Object.keys(WORDS).filter((k) => k.length >= 6);
const STOP_SET = new Set(TL_STOPWORDS);

/** "sertifikasyon" → the entry for "sertipikasyon": a longer Filipino word with a single typo still translates. */
function fuzzyWord(w: string): string | undefined {
  if (w.length < 6 || STOP_SET.has(w) || /^\d+$/.test(w)) return undefined;
  let best: string | undefined;
  for (const k of WORD_KEYS) if (k[0] === w[0] && editDistance(w, k, 1) <= 1) best = k;
  return best === undefined ? undefined : WORDS[best];
}

/** Filipino links words with "-ng": "pinakabagong" = "pinakabago" + ng, "kasalukuyang" = "kasalukuyan" + g. */
function ligature(w: string): string | undefined {
  if (w.length < 6 || !w.endsWith("ng")) return undefined;
  return WORDS[w.slice(0, -2)] ?? WORDS[w.slice(0, -1)];
}

/** Multi-word Filipino expressions, applied before the word-by-word translation. */
const PHRASES: [RegExp, string][] = [
  // specific questions first — the generic "ano ang …" rule below would otherwise swallow them
  [/\bgaano (na )?katagal\b|\bilang taon (na )?(siya )?(sa|ng)\b/g, "how long"],
  [/\bano (ang )?(mga )?(natutunan|natutuhan)\b/g, "what learned"],
  [/\b(sino|ano) (ang )?(mga )?(kasama|kagrupo|katrabaho|kasamahan)\b/g, "who team"],
  [/\bano (ang )?(tungkulin|papel|posisyon|role|ginagampanan)\b/g, "what role"],
  [/\bano (ang )?(pinaka ?)?(bago|huling|latest|recent)\b/g, "what latest"],
  [/\bano (ang )?kasalukuyan(g)?\b|\bano (ang )?(pa )?ginagawa (niya|nya|ni john) (ngayon|ngayong)\b|\bano (ang )?pinagkakaabalahan\b/g, "what current"],
  [/\bano (ba )?(po )?(ang )?ibig sabihin ng\b/g, "what is meaning "],
  [/\bano (ba )?(po )?(ang |yung |yong |ung |ito |iyon |iyan )/g, "what is "],
  [/\b(nag ?aral|pinag ?aralan|pinag ?aral|nag ?tapos|nakapag ?tapos)\b/g, "studied school university"],
  [/\b(nag ?intern|nag ?internship|nag ?ojt)\b/g, "intern"],
  [/\bsaan (ba )?(siya |si john |si aldwin )?(nakatira|nakabase|naka base|tumitira|taga|galing|nakalagay)\b|\btaga ?saan\b/g, "where based location"],
  [/\bbukas (ba )?(siya |si john |si aldwin )?(sa|para sa) (trabaho|work|oportunidad|opurtunidad|opportunity|alok|job)\b/g, "is he open to work"],
  [/\bilang taon\b|\bilang taong gulang\b/g, "how old"],
];

export function toEnglish(norm: string): string {
  let s = norm;
  for (const [re, rep] of PHRASES) s = s.replace(re, rep);
  return s
    .split(" ")
    .map((w) => WORDS[w] ?? ligature(w) ?? fuzzyWord(w) ?? w)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const MARKERS = new Set([...TL_STOPWORDS, ...Object.keys(WORDS), "kumusta", "kamusta", "musta", "salamat", "opo", "magandang", "paalam", "mabuhay", "dagdag", "ituloy"]);
// Words that are also English — never count them as evidence that the visitor is writing Filipino.
["at", "may", "pa", "di", "no", "in", "mag", "nag"].forEach((w) => MARKERS.delete(w));

/** Is the question (mostly) Filipino / Taglish? Used to choose the language of the assistant's own sentences. */
export function detectLang(norm: string): Lang {
  const words = norm.split(" ").filter(Boolean);
  const hits = words.filter((w) => MARKERS.has(w)).length;
  return hits >= 2 || (hits === 1 && words.length <= 3) ? "tl" : "en";
}

/** Filipino question starter (Ano/Sino/Saan/…): these are NOT yes/no questions even if they contain "ba". */
export const TL_WH = /^\s*(ano|anong|sino|saan|nasaan|kailan|paano|bakit|magkano|ilan|alin|kanino)\b/;
/** Filipino yes/no question: contains the question particle "ba". */
export const isTagalogYesNo = (norm: string) => /\bba\b/.test(norm) && !TL_WH.test(norm);

/** Filipino versions of the conversation rules (the English ones live in engine.ts). */
export const TL = {
  greeting: /^\s*(kumusta|kamusta|musta|magandang\s+(umaga|hapon|gabi|tanghali|araw)|mabuhay|uy|hoy|hi po|hello po|good day)\b/,
  thanks: /\b(salamat|tenkyu|thank you po|thanks po)\b/,
  bye: /^\s*(paalam|bye po|hanggang sa muli|hanggang sa susunod|ingat|sige po|sige na po|tapos na po|okay na po)\b/,
  identity: /\bsino ka\b|\bikaw ba (si|ang) (john|aldwin)\b|\b(robot|bot|ai|tao|totoo) ka ba\b|\bano (ang )?pangalan mo\b|\bsino (ang )?gumawa sa iyo\b/,
  help: /^\s*(tulong|menu)\b|\bano (ang )?(pwede|puwede|maaari) (kong|ko) itanong\b|\bano (ang )?(kaya|alam) mo\b|\bano ang matutulungan\b|\bpaano kita magagamit\b/,
  more: /^\s*(dagdag pa|karagdagan pa|ituloy mo|ituloy|sige pa|ano pa|mayroon pa|meron pa|higit pa|mas marami pa|dagdagan mo)\s*[?!.]*\s*$/,
  offTopic: /\b(panahon|ulan|biro|kanta|resipe|balita|pelikula|sine|horoscope|lotto|pangulo|presidente)\b/,
  who: /\bsino (ba )?(po )?(si |ang )?(john|aldwin|samson|siya)\b|\bipakilala (mo )?(si )?(john|siya|ang sarili)\b|\bkilalanin\b|\btungkol (kay|sa) (john|aldwin|kanya|kaniya)\b|\bano (ang )?(ginagawa|trabaho|propesyon) (ni|ng) (john|aldwin|siya)\b|\bano ang ginagawa niya\b|\b(ikuwento|ikwento|kwento|magkuwento|ilarawan)\b.*\b(john|aldwin|siya|kanya|kaniya)\b/,
  availability: /\bavailable ba\b|\bbakante ba\b|\bnaghahanap ba (siya |si john )?(ng )?(trabaho|work)\b|\b(pwede|puwede|maaari) (ko|ba|bang) (ba )?(siyang )?(i )?(hire|kunin|upahan|tanggapin)\b/,
  whyHire: /\bbakit\b.*\b(hire|kunin|piliin|upahan|tanggapin|pumili)\b|\bano (ang )?(lakas|kalakasan|strengths?|nagpapaiba)\b/,
  resume: /\bbio ?data\b/,
  location: /\bnasaan (ba )?(siya|si john)\b|\bsaan (ang )?(lokasyon|location|base)\b/,
  /** Pronouns that point back at the previous topic: "doon", "dito", "niyan", "iyon"… */
  anaphora: /\b(doon|dun|dito|diyan|dyan|dito|niyan|nito|noon|iyon|iyan|ito|yan|yun|yon|ganun|ganon|parehas|pareho)\b/,
};
