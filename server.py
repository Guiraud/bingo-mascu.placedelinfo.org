"""Serveur HTTP avec persistance SQLite pour le bingo."""

from __future__ import annotations

import json
import sqlite3
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import ThreadingMixIn
from urllib.parse import urlparse
from threading import Lock


BASE_DIR = Path(__file__).resolve().parent
LEGACY_DB_PATH = BASE_DIR / "argumentaires.db"
JSON_DB_PATH = BASE_DIR / "argumentaires.json"
DB_LOCK = Lock()

INITIAL_ARGUMENTAIRES = [
    {
        "phrase": "Sois un homme",
        "argumentaire": "Cette injonction repose sur la masculinité hégémonique, restreint l'expression émotionnelle et favorise des comportements à risque.",
        "sources": [
            {
                "titre": "Masculinities",
                "auteur": "R.W. Connell",
                "url": "https://genderandmasculinities.files.wordpress.com/2017/02/robert-w-connell-masculinities-second-edition-3.pdf",
            },
            {
                "titre": "WHO: Challenging harmful masculinities",
                "url": "https://www.who.int/news/item/12-04-2024-challenging-harmful-masculinities-and-engaging-men-and-boys-in-sexual-and-reproductive-health",
            },
        ],
    },
    {
        "phrase": "Les hommes ne pleurent pas",
        "argumentaire": "Refouler les émotions encourage anxiété et dépression ; les différences ne sont pas biologiques mais culturelles.",
        "sources": [
            {
                "titre": "Toward the reconstruction of masculinity",
                "auteur": "Levant",
                "url": "https://www.semanticscholar.org/paper/Toward-the-reconstruction-of-masculinity-Levant/bd992654a9ed4ee80c128b2c97ef47da9acc2eb7",
            }
        ],
    },
    {
        "phrase": "Pas tous les hommes",
        "argumentaire": "Occulte le caractère structurel des violences de genre documenté par l’ONU et l’INSEE.",
        "sources": [
            {
                "titre": "Man Enough: Donald Trump...",
                "auteur": "Katz",
                "url": "https://www.mediaed.org/why-are-so-many-young-male-voters-gravitating-toward-donald-trump/",
            }
        ],
    },
    {
        "phrase": "Les féministes détestent les hommes",
        "argumentaire": "Stéréotype infondé ; les féminismes visent l’égalité et incluent les hommes comme alliés.",
        "sources": [
            {
                "titre": "Backlash: The Undeclared War Against American Women",
                "auteur": "Faludi",
                "url": "https://books.google.com/books/about/Backlash.html?id=GfDa1cdeHT0C",
            },
            {
                "titre": "Backlash PDF",
                "url": "https://seminariolecturasfeministas.files.wordpress.com/2012/01/faludi-susan-backlash-the-undeclared-war-against-american-women.pdf",
            },
        ],
    },
    {
        "phrase": "On ne peut plus rien dire",
        "argumentaire": "Réaction à la remise en cause des privilèges discursifs, pas une atteinte à la liberté d’expression.",
        "sources": [
            {
                "titre": "Fortunes Of Feminism",
                "auteur": "Nancy Fraser",
                "url": "https://archive.org/details/fortunes-of-feminism-from-state-managed-capitalism-to-neoliberal-crisis-by-nancy-fraser-2013",
            }
        ],
    },
    {
        "phrase": "C'était pour rire",
        "argumentaire": "L’humour sexiste banalise et entretient les discriminations.",
        "sources": [
            {
                "titre": "Social consequences of disparagement humor",
                "auteur": "Ford & Ferguson",
                "url": "https://pubmed.ncbi.nlm.nih.gov/15121541/",
            },
            {
                "titre": "PDF: Social consequences humor",
                "url": "https://www.academia.edu/72723461/The_social_consequences_of_disparagement_humor_Introduction_and_overview",
            },
        ],
    },
    {
        "phrase": "Elle l'a cherché",
        "argumentaire": "Mythe du viol, culpabilise la victime, démenti par toutes les enquêtes.",
        "sources": [
            {
                "titre": "Using social norms to reduce men's rape proclivity",
                "url": "https://kar.kent.ac.uk/26184/1/Bohner%20Pina%20Viki%20Siebler%202010%20PCL%20final-MS.pdf",
            },
            {
                "titre": "The moderating role of gender and rape myth acceptance",
                "url": "https://core.ac.uk/download/pdf/15980425.pdf",
            },
        ],
    },
    {
        "phrase": "Les femmes sont trop émotives",
        "argumentaire": "Aucune base biologique ; c’est une construction sociale.",
        "sources": [
            {
                "titre": "Delusions of Gender",
                "auteur": "Cordelia Fine",
                "url": "https://www.worldcat.org/title/664669074",
            },
            {
                "titre": "The Gendered Brain",
                "auteur": "Gina Rippon",
                "url": "https://www.worldcat.org/title/1037896125",
            },
        ],
    },
    {
        "phrase": "Les quotas, c'est injuste",
        "argumentaire": "Les quotas corrigent les inégalités et améliorent la représentation.",
        "sources": [
            {
                "titre": "Feminist Trouble: Intersectional Politics",
                "auteur": "Lépinard",
                "url": "https://www.worldcat.org/title/1119478787",
            },
            {
                "titre": "Women, Politics, and Power",
                "auteur": "Paxton & Hughes",
                "url": "https://www.worldcat.org/title/861693778",
            },
        ],
    },
    {
        "phrase": "La galanterie prouve le respect",
        "argumentaire": "C’est du sexisme bienveillant qui maintient la domination sous couvert de protection.",
        "sources": [
            {
                "titre": "The Ambivalent Sexism Inventory",
                "auteur": "Glick & Fiske",
                "url": "https://www.researchgate.net/publication/14295473_The_Ambivalent_Sexism_Inventory",
            }
        ],
    },
    {
        "phrase": "La drague lourde, c'est normal",
        "argumentaire": "La drague lourde est une forme de harcèlement ; elle nie le consentement.",
        "sources": [
            {
                "titre": "Surviving Sexual Violence",
                "auteur": "Kelly",
                "url": "https://www.worldcat.org/title/12865167",
            },
            {
                "titre": "La construction du masculin",
                "auteur": "Welzer-Lang",
                "url": "https://www.worldcat.org/title/798875797",
            },
        ],
    },
    {
        "phrase": "Les mères sont faites pour ça",
        "argumentaire": "La maternité est une construction sociale non un instinct.",
        "sources": [
            {
                "titre": "L’amour en plus",
                "auteur": "Badinter",
                "url": "https://www.worldcat.org/title/70236147",
            },
            {
                "titre": "La femme seule et le prince charmant",
                "auteur": "Kaufmann",
                "url": "https://www.worldcat.org/title/40987290",
            },
        ],
    },
    {
        "phrase": "Le viol, c'est rare",
        "argumentaire": "Les chiffres montrent que c’est un phénomène massif et sous-déclaré.",
        "sources": [
            {
                "titre": "ENVEFF",
                "url": "https://www.ined.fr/fr/tout-savoir-population/chiffres/france/enveff-violences-femmes/",
            },
            {
                "titre": "Virage INED",
                "url": "https://www.ined.fr/fr/recherche/recherche-multi-thematique/enquete-virage/",
            },
        ],
    },
    {
        "phrase": "La charge mentale n'existe pas",
        "argumentaire": "Le concept existe, théorisé et vérifié par enquêtes INSEE.",
        "sources": [
            {
                "titre": "Haicault. La gestion ordinaire de la vie en deux",
                "url": "https://www.worldcat.org/title/759608026",
            },
            {
                "titre": "INSEE Emploi du temps",
                "url": "https://www.insee.fr/fr/statistiques/4797750",
            },
        ],
    },
    {
        "phrase": "Les féminicides, mot militant",
        "argumentaire": "Reconnu internationalement et dans les politiques publiques.",
        "sources": [
            {
                "titre": "ONU Handbook on Violence against Women",
                "url": "https://www.unwomen.org/en/digital-library/publications/2009/07/handbook-for-legislation-on-violence-against-women",
            },
            {
                "titre": "Ministère Intérieur étude féminicides",
                "url": "https://www.interieur.gouv.fr/actualites/communiques/feminicides-les-chiffres-cles",
            },
        ],
    },
    {
        "phrase": "On a déjà l'égalité",
        "argumentaire": "Les rapports internationaux montrent de nombreux écarts persistants.",
        "sources": [
            {
                "titre": "Global Gender Gap Report 2022",
                "url": "https://www.weforum.org/reports/global-gender-gap-report-2022",
            },
            {
                "titre": "INSEE Inégalités femmes-hommes",
                "url": "https://www.insee.fr/fr/statistiques/2662545",
            },
        ],
    },
    {
        "phrase": "Les femmes conduisent mal",
        "argumentaire": "Les données montrent que les hommes causent la majorité des accidents mortels.",
        "sources": [
            {
                "titre": "ONISR 2021 sécurité routière",
                "url": "https://www.onisr.securite-routiere.gouv.fr/sites/default/files/2022-06/Bilan-consolid%C3%A9-accidentalit%C3%A9-2021-def.pdf",
            }
        ],
    },
    {
        "phrase": "Garçon manqué",
        "argumentaire": "Ce terme sanctionne l’écart au genre ; la spécialisation des rôles est sociale, non naturelle.",
        "sources": [
            {
                "titre": "Duru-Bellat, division sexuée des filières",
                "url": "https://hal.science/hal-01469347/document",
            }
        ],
    },
    {
        "phrase": "Elle exagère",
        "argumentaire": "Minimiser ou accuser d’exagération est du gaslighting ; la tendance générale est à la sous-déclaration.",
        "sources": [
            {
                "titre": "Turning up the lights on gaslighting",
                "auteur": "Abramson",
                "url": "https://philarchive.org/archive/ABRTUT",
            }
        ],
    },
    {
        "phrase": "Friendzone",
        "argumentaire": "Concept qui crée une dette sexuelle imaginaire ; favorise l’objectification.",
        "sources": [
            {
                "titre": "Sexual economics",
                "auteur": "Baumeister & Vohs",
                "url": "https://www.researchgate.net/publication/51963329_Sexual_Economics_A_Comparison_of_Sex_Money_and",
            }
        ],
    },
    {
        "phrase": "Si elle dit non, c'est oui",
        "argumentaire": "Mythe rigoureusement déconstruit : seul le consentement explicite compte.",
        "sources": [
            {
                "titre": "Using social norms to reduce men's rape proclivity",
                "url": "https://kar.kent.ac.uk/26184/1/Bohner%20Pina%20Viki%20Siebler%202010%20PCL%20final-MS.pdf",
            }
        ],
    },
    {
        "phrase": "Le harcèlement, c'est subjectif",
        "argumentaire": "Définition juridique et médicale objective ; effet prouvé sur la santé.",
        "sources": [
            {
                "titre": "Einarsen, Harassment at Work",
                "url": "https://www.cambridge.org/core/books/harassment-bullying-and-violence-at-work/E17FE178073D689B7D6637FF9B747E3A",
            }
        ],
    },
    {
        "phrase": "Les règles, ce n'est pas un sujet",
        "argumentaire": "La menstruation est un enjeu de santé, l’occultation aggrave les inégalités.",
        "sources": [
            {
                "titre": "UNESCO: Menstrual Health & School",
                "url": "https://unesdoc.unesco.org/ark:/48223/pf0000233576",
            }
        ],
    },
    {
        "phrase": "C'est un compliment",
        "argumentaire": "Commentaires non désirés réduisent à l’apparence et sont vécus comme oppressifs.",
        "sources": [
            {
                "titre": "Street harassment article",
                "auteur": "Bowman",
                "url": "https://scholarship.law.cornell.edu/cgi/viewcontent.cgi?article=1394&context=clr",
            }
        ],
    },
    {
        "phrase": "Le consentement tue la séduction",
        "argumentaire": "Le consentement explicite renforce le respect mutuel et la qualité de la séduction.",
        "sources": [
            {
                "titre": "College students and sexual consent",
                "auteur": "Jozkowski & Peterson",
                "url": "https://www.tandfonline.com/doi/full/10.1080/00224499.2013.772872",
            }
        ],
    },
    {
        "phrase": "La parité baisse le niveau",
        "argumentaire": "La parité améliore la performance des groupes et entreprises.",
        "sources": [
            {
                "titre": "Women Matter McKinsey",
                "url": "https://www.mckinsey.com/featured-insights/diversity-and-inclusion/women-matter",
            }
        ],
    },
    {
        "phrase": "Nature masculine violente",
        "argumentaire": "Aucune preuve biologique ; la violence est contextuelle.",
        "sources": [
            {
                "titre": "Masculinities",
                "auteur": "Connell",
                "url": "https://genderandmasculinities.files.wordpress.com/2017/02/robert-w-connell-masculinities-second-edition-3.pdf",
            },
            {
                "titre": "Sex differences in aggression",
                "auteur": "Archer",
                "url": "https://www.researchgate.net/publication/26646340_Does_sexual_selection_explain_human_sex_differences_in_aggression",
            },
        ],
    },
    {
        "phrase": "C'est la biologie",
        "argumentaire": "La plasticité cérébrale et le contexte social expliquent les différences.",
        "sources": [
            {
                "titre": "Delusions of Gender",
                "auteur": "Fine",
                "url": "https://www.worldcat.org/title/664669074",
            },
            {
                "titre": "Gendered Brain",
                "auteur": "Rippon",
                "url": "https://www.worldcat.org/title/1037896125",
            },
        ],
    },
    {
        "phrase": "Elle ment pour nuire",
        "argumentaire": "Les fausses accusations sont rares, bien moins nombreuses que les cas non déclarés.",
        "sources": [
            {
                "titre": "ONS false allegations stats",
                "url": "https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice/articles/sexualoffendingvictimsandthecriminaljusticesystem/november2020",
            },
            {
                "titre": "INED Violences et rapports de genre",
                "url": "https://www.ined.fr/fr/recherche/recherche-multi-thematique/enquete-virage/",
            },
        ],
    },
]


def _sanitize_source(entry: dict[str, str]) -> dict[str, str] | None:
    titre = (entry.get("titre") or "").strip()
    auteur = (entry.get("auteur") or "").strip()
    url = (entry.get("url") or "").strip()
    if not titre and not url:
        return None
    result: dict[str, str] = {}
    if titre:
        result["titre"] = titre
    if auteur:
        result["auteur"] = auteur
    if url:
        result["url"] = url
    return result


def _sanitize_item(item: dict[str, object]) -> dict[str, object] | None:
    phrase = (str(item.get("phrase", ""))).strip()
    argumentaire = (str(item.get("argumentaire", ""))).strip()
    if not phrase or not argumentaire:
        return None

    sources_raw = item.get("sources")
    sources: list[dict[str, str]] = []
    if isinstance(sources_raw, list):
        for entry in sources_raw:
            if not isinstance(entry, dict):
                continue
            cleaned = _sanitize_source(entry)
            if cleaned:
                sources.append(cleaned)

    return {
        "phrase": phrase,
        "argumentaire": argumentaire,
        "sources": sources,
    }


def _load_legacy_sqlite() -> list[dict[str, object]]:
    if not LEGACY_DB_PATH.exists():
        return []
    try:
        conn = sqlite3.connect(LEGACY_DB_PATH)
        conn.row_factory = sqlite3.Row
    except sqlite3.Error:
        return []
    try:
        rows = conn.execute(
            "SELECT phrase, argumentaire, sources FROM argumentaires"
        ).fetchall()
    except sqlite3.Error:
        return []
    finally:
        conn.close()

    legacy: list[dict[str, object]] = []
    for row in rows:
        raw_sources = row["sources"]
        parsed_sources: list[dict[str, str]]
        if isinstance(raw_sources, str) and raw_sources.strip():
            try:
                parsed = json.loads(raw_sources)
            except json.JSONDecodeError:
                parsed = []
        else:
            parsed = []
        if not isinstance(parsed, list):
            parsed = []
        legacy.append(
            {
                "phrase": row["phrase"],
                "argumentaire": row["argumentaire"],
                "sources": parsed,
            }
        )
    return legacy


def _read_json_store() -> list[dict[str, object]]:
    if not JSON_DB_PATH.exists():
        return []
    try:
        with JSON_DB_PATH.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return []

    if not isinstance(data, list):
        return []

    sanitized: list[dict[str, object]] = []
    for entry in data:
        if isinstance(entry, dict):
            cleaned = _sanitize_item(entry)
            if cleaned:
                sanitized.append(cleaned)
    return sanitized


def _write_json_store(items: list[dict[str, object]]) -> None:
    tmp_path = JSON_DB_PATH.with_name(f"{JSON_DB_PATH.name}.tmp")
    payload = sorted(items, key=lambda it: it["phrase"].lower())
    with tmp_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    tmp_path.replace(JSON_DB_PATH)


def _load_store_map() -> dict[str, dict[str, object]]:
    existing = {item["phrase"]: item for item in _read_json_store()}
    if not existing:
        for item in INITIAL_ARGUMENTAIRES:
            cleaned = _sanitize_item(item)
            if cleaned:
                existing.setdefault(cleaned["phrase"], cleaned)
    return existing


def init_db() -> None:
    with DB_LOCK:
        merged: dict[str, dict[str, object]] = {}
        for source in (INITIAL_ARGUMENTAIRES, _read_json_store(), _load_legacy_sqlite()):
            for entry in source:
                if not isinstance(entry, dict):
                    continue
                cleaned = _sanitize_item(entry)
                if cleaned:
                    merged[cleaned["phrase"]] = cleaned
        _write_json_store(list(merged.values()))


def fetch_argumentaires() -> list[dict[str, object]]:
    with DB_LOCK:
        items = list(_load_store_map().values())
    return sorted(items, key=lambda it: it["phrase"].lower())


def upsert_argumentaire(
    phrase: str,
    argumentaire: str,
    sources: list[dict[str, str]] | None = None,
) -> None:
    with DB_LOCK:
        store = _load_store_map()
        entry = {
            "phrase": phrase,
            "argumentaire": argumentaire,
            "sources": sources or [],
        }
        cleaned = _sanitize_item(entry)
        if cleaned is None:
            raise ValueError("Phrase ou argumentaire manquant après nettoyage")
        store[cleaned["phrase"]] = cleaned
        _write_json_store(list(store.values()))


class RequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def end_headers(self):
        if self.path.startswith("/api/"):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self):  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/argumentaires":
            self._handle_get_argumentaires()
        else:
            super().do_GET()

    def do_POST(self):  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/argumentaires":
            self._handle_post_argumentaire()
        else:
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint inconnu")

    def _handle_get_argumentaires(self) -> None:
        data = fetch_argumentaires()
        self._send_json(HTTPStatus.OK, data)

    def _handle_post_argumentaire(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            self._send_json(
                HTTPStatus.BAD_REQUEST,
                {"error": "Corps JSON manquant"},
            )
            return

        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            self._send_json(
                HTTPStatus.BAD_REQUEST,
                {"error": "JSON invalide"},
            )
            return

        phrase = (payload.get("phrase") or "").strip()
        argumentaire = (payload.get("argumentaire") or "").strip()
        sources_raw = payload.get("sources")
        if not phrase or not argumentaire:
            self._send_json(
                HTTPStatus.BAD_REQUEST,
                {"error": "'phrase' et 'argumentaire' sont requis"},
            )
            return

        sources: list[dict[str, str]]
        if sources_raw is None:
            sources = []
        elif isinstance(sources_raw, list):
            sources = []
            for entry in sources_raw:
                if not isinstance(entry, dict):
                    continue
                titre = (entry.get("titre") or "").strip()
                auteur = (entry.get("auteur") or "").strip()
                url = (entry.get("url") or "").strip()
                if not titre and not url:
                    continue
                item: dict[str, str] = {}
                if titre:
                    item["titre"] = titre
                if auteur:
                    item["auteur"] = auteur
                if url:
                    item["url"] = url
                sources.append(item)
        else:
            return self._send_json(
                HTTPStatus.BAD_REQUEST,
                {"error": "'sources' doit être un tableau d'objets"},
            )

        upsert_argumentaire(phrase, argumentaire, sources)
        self._send_json(
            HTTPStatus.OK,
            {"phrase": phrase, "argumentaire": argumentaire, "sources": sources},
        )

    def _send_json(self, status: HTTPStatus, payload: object) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


def run_server(port: int = 8000) -> None:
    init_db()
    server_address = ("", port)
    httpd = ThreadedHTTPServer(server_address, RequestHandler)
    print(f"Serveur lancé sur http://localhost:{port}/")
    print("Arrêt : CTRL+C")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt demandé, fermeture...")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    run_server()
