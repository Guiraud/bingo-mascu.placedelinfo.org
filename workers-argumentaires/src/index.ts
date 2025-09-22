interface Env {
  KV_ARGUMENTAIRES: KVNamespace;
  TURNSTILE_SECRET?: string;
  API_SHARED_SECRET?: string;
}

interface SourceItem {
  titre?: string;
  auteur?: string;
  url?: string;
}

interface ArgumentaireItem {
  phrase: string;
  argumentaire: string;
  sources?: SourceItem[];
  updated_at: string;
  ip_hash?: string;
}

interface PhenomenonItem {
  id: string;
  nom: string;
  description: string;
  sources?: SourceItem[];
}

const ARGUMENTAIRES_KEY = 'argumentaires.json';
const PHENOMENES_KEY = 'phenomenes.json';
const TOKEN_PREFIX = 'admin-token:';
const ADMIN_PASSWORD_HASH = '23f6249ea0388a75929454e3faf127af2b80bd69bdcbf45d1b4de399da47d51a';
const ADMIN_TOKEN_TTL_SECONDS = 3600;

const RATE_LIMIT_PREFIX = 'rate-limit';
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_BUCKET_SECONDS = 60;
const MAX_SOURCES = 12;

const STATIC_ALLOWED_ORIGINS = new Set(
  [
    'https://bingo-mascu.mehdiguiraud.net',
    'https://bingo-mascu-placedelinfo-org-71e588.gitlab.io',
    'https://workers-argumentaires.mehdi-guiraud.workers.dev',
    'https://workers-argumentaires-dev.mehdi-guiraud.workers.dev',
    'https://dev.workers-argumentaires.guiraud.workers.dev',
    'http://localhost:8000',
    'http://127.0.0.1:8787'
  ].map(origin => origin.toLowerCase())
);

const FLEXIBLE_ALLOWED_SUFFIXES = ['.gitlab.io', '.github.io', '.workers.dev'];

const DEFAULT_PHENOMENES: PhenomenonItem[] = [
  {
    id: 'patriarcat',
    nom: 'Patriarcat',
    description: 'Système de domination qui attribue aux hommes le contrôle des sphères politiques, économiques, religieuses et familiales, tout en cantonnant les femmes aux rôles de soins et de reproduction. Il légitime l’infériorisation matérielle et symbolique des femmes et banalise les violences sexistes qui assurent le maintien de cette hiérarchie.',
    sources: [
      {
        titre: 'ONU Femmes – Mettre fin à la violence à l’égard des femmes',
        url: 'https://www.unwomen.org/fr/articles/faits-et-chiffres/faits-et-chiffres-mettre-fin-a-la-violence-a-legard-des-femmes'
      }
    ]
  },
  {
    id: 'androcentrisme',
    nom: 'Androcentrisme',
    description: 'Mode de pensée qui érige l’expérience masculine en référence universelle, reléguant celles des femmes au second plan. L’androcentrisme transforme les récits, médias ou politiques publiques en miroirs d’intérêts masculins, invisibilisant apports, besoins et savoirs féminins.',
    sources: [
      {
        titre: 'Pourquoi l’histoire a effacé les femmes – Histoire d’en parler',
        url: 'https://www.histoiredenparler.com/post/pourquoi-l-histoire-a-effac%C3%A9-les-femmes-titiou-lecoq'
      }
    ]
  },
  {
    id: 'misogynie',
    nom: 'Misogynie',
    description: 'Haîne et mépris structurels dirigés contre les femmes en tant que groupe, qui s’expriment par l’intimidation, les discriminations et des violences allant jusqu’au meurtre. La misogynie entretient l’idée qu’une place “naturelle” des femmes est l’obéissance et rend acceptable la domination masculine.',
    sources: [
      {
        titre: 'NousToutes – Comprendre les chiffres des violences sexistes',
        url: 'https://www.noustoutes.org/comprendre-les-chiffres/'
      }
    ]
  },
  {
    id: 'sexisme',
    nom: 'Sexisme',
    description: 'Ensemble de stéréotypes et de pratiques discriminatoires fondés sur le sexe ou le genre qui valorise l’“ordre masculin” et dévalorise le travail féminin. Le sexisme impose des scripts de comportement, un double standard moral et des carrières freinées qui reconduisent l’inégalité matérielle.',
    sources: [
      {
        titre: 'Sexisme — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Sexisme'
      }
    ]
  },
  {
    id: 'phallocratie',
    nom: 'Phallocratie',
    description: 'Organisation sociale où le pouvoir symbolique et institutionnel reste monopolisé par les hommes, du foyer à l’État. La phallocratie glorifie l’autorité masculine comme norme de légitimité et naturalise l’exclusion des femmes des espaces de décision.',
    sources: [
      {
        titre: 'Phallocratie — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Phallocratie'
      }
    ]
  },
  {
    id: 'division-sexuee-travail',
    nom: 'Division sexuée du travail',
    description: 'Répartition genrée des tâches qui associe les femmes au soin, au domestique et aux emplois sous-payés, tandis que les hommes se concentrent dans les secteurs techniques ou de prestige. Cette division invisibilise le travail reproductif féminin et justifie l’écart salarial persistant.',
    sources: [
      {
        titre: 'Division sexuelle du travail — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Division_sexuelle_du_travail'
      }
    ]
  },
  {
    id: 'loi-salique',
    nom: 'Loi salique',
    description: 'Principe successoral historique qui interdit aux femmes d’hériter du trône ou de transmettre un droit dynastique, assignant la souveraineté aux lignées masculines. Cette exclusion a servi de modèle pour écarter les femmes des responsabilités politiques jusqu’à l’époque moderne.',
    sources: [
      {
        titre: 'Loi salique — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Loi_salique'
      }
    ]
  },
  {
    id: 'code-napoleon',
    nom: 'Code Napoléon',
    description: 'Le Code civil napoléonien a légalement placé l’épouse sous tutelle maritale : incapacité juridique, impossibilité de signer un contrat, d’administrer ses biens ou de percevoir son salaire sans l’accord du mari. Ce dispositif a fixé l’infériorité civile des femmes pendant plus d’un siècle.',
    sources: [
      {
        titre: 'Code civil (France) – Place de la femme',
        url: 'https://fr.wikipedia.org/wiki/Code_civil_(France)#La_place_de_la_femme'
      }
    ]
  },
  {
    id: 'tutelle-masculine',
    nom: 'Tutelle masculine',
    description: 'Régime de tutelle qui oblige les femmes à obtenir l’autorisation d’un père, mari ou fils adulte pour voyager, travailler ou accéder à la santé, comme en Arabie saoudite jusqu’en 2019. Il maintient les femmes dans un statut de mineures à vie et restreint drastiquement leurs libertés fondamentales.',
    sources: [
      {
        titre: 'HRW – Arabie saoudite : les femmes sous l’emprise de la tutelle masculine',
        url: 'https://www.hrw.org/fr/news/2016/07/17/arabie-saoudite-les-femmes-sous-lemprise-de-la-tutelle-masculine'
      }
    ]
  },
  {
    id: 'exclusion-suffrage',
    nom: 'Exclusion du suffrage',
    description: 'Exclusion systématique des femmes de la citoyenneté politique : le suffrage “universel” instauré au XIXe siècle ne concernait que les hommes et les femmes françaises n’ont obtenu le vote qu’en 1944. L’absence de représentation féminine a retardé toute prise en compte de leurs droits civils et sociaux.',
    sources: [
      {
        titre: 'Oxfam France – Droit de vote des femmes',
        url: 'https://www.oxfamfrance.org/inegalites-femmes-hommes/droit-de-vote-des-femmes/'
      }
    ]
  },
  {
    id: 'chasses-sorcieres',
    nom: 'Chasses aux sorcières',
    description: 'Entre les XVe et XVIIe siècles, des dizaines de milliers de femmes accusées de sorcellerie ont été torturées ou exécutées, ciblant sages-femmes, guérisseuses ou femmes indépendantes. Cette répression a servi à imposer le contrôle masculin du savoir médical et à renvoyer les femmes au foyer.',
    sources: [
      {
        titre: 'Femmes de droit – Sorcières',
        url: 'https://femmesdedroit.be/informations-juridiques/abecedaire/sorcieres/'
      }
    ]
  },
  {
    id: 'polygynie',
    nom: 'Polygynie',
    description: 'Pratique matrimoniale qui autorise un homme à épouser plusieurs femmes, créant une hiérarchie interne où les épouses sont interchangeables et en concurrence. La polygynie concentre les ressources et la descendance autour d’un patriarche et confisque l’autonomie sexuelle et économique des femmes.',
    sources: [
      {
        titre: 'Polygynie — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Polygynie'
      }
    ]
  },
  {
    id: 'patronymie',
    nom: 'Patronymie obligatoire',
    description: 'Règle de filiation qui impose le nom du père et efface la lignée maternelle, résidu de la loi salique modernisée. Malgré les réformes récentes, la majorité des enfants portent encore uniquement le patronyme paternel, signe de la persistance de la primauté symbolique masculine.',
    sources: [
      {
        titre: 'Le Monde – Depuis 2002, le nom de famille a remplacé le nom patronymique',
        url: 'https://www.lemonde.fr/societe/article/2010/01/06/depuis-2002-le-nom-de-famille-a-remplace-le-nom-patronymique_1288080_3224.html'
      }
    ]
  },
  {
    id: 'prince-charmant',
    nom: 'Mythe du prince charmant',
    description: 'Narratif qui apprend aux filles qu’elles doivent attendre d’être choisies et sauvées par un homme, ce qui entretient dépendance affective et financière. Ce mythe normalise le déséquilibre dans la prise d’initiative et fait peser sur les femmes la responsabilité de réussir la relation.',
    sources: [
      {
        titre: 'France Culture – Le mythe du prince charmant',
        url: 'https://www.radiofrance.fr/franceculture/podcasts/la-serie-documentaire/le-mythe-du-prince-charmant-3041923'
      }
    ]
  },
  {
    id: 'syndrome-belle-au-bois-dormant',
    nom: 'Syndrome de la Belle au bois dormant',
    description: 'Concept popularisé par Colette Dowling : socialisation qui encourage les femmes à se retirer de la carrière scientifique ou technologique, par peur de ne pas être aimées si elles réussissent. Il en résulte une auto-censure et une sous-représentation des femmes dans les postes de haut niveau.',
    sources: [
      {
        titre: 'Colette Dowling – The Cinderella Complex',
        url: 'https://www.worldcat.org/title/8592724'
      }
    ]
  },
  {
    id: 'mur-maman',
    nom: 'Mur des mamans',
    description: 'Pénalité professionnelle qui frappe les mères : elles se voient confier moins de responsabilités, reçoivent moins d’avancements et subissent des remarques sur leur disponibilité. Tandis que les pères sont perçus comme stables, les mères sont soupçonnées d’être moins investies.',
    sources: [
      {
        titre: 'Harvard Kennedy School – The Motherhood Penalty',
        url: 'https://www.hks.harvard.edu/centers/wappp/news-events/wappp-women-and-public-policy-program/community-news/motherhood-penalty'
      }
    ]
  },
  {
    id: 'charge-mentale',
    nom: 'Charge mentale',
    description: 'Tâche d’organisation invisible (planning, anticipation, coordination) qui repose majoritairement sur les femmes, même quand les tâches sont partagées. Elle crée une fatigue cognitive qui limite la disponibilité pour d’autres projets professionnels ou militants.',
    sources: [
      {
        titre: 'Emma – Fallait demander',
        url: 'https://emma-clit.com/blog/fallait-demander'
      }
    ]
  },
  {
    id: 'syndrome-imposture',
    nom: 'Syndrome d’imposture genré',
    description: 'Sous l’effet de stéréotypes de compétence masculins, les femmes doutent davantage de leurs capacités et s’auto-excluent des candidatures ambitieuses. Ce syndrome limite la prise de parole et l’accès aux postes de direction.',
    sources: [
      {
        titre: 'Revue Project – Le syndrome de l’imposteur',
        url: 'https://www.revue-projet.com/articles/2016-06-le-syndrome-de-l-imposteur/'
      }
    ]
  },
  {
    id: 'langage-inclusive',
    nom: 'Contestations du langage inclusif',
    description: 'Refus de visibiliser les femmes dans la langue en invoquant la “neutralité” masculine : le masculin “générique” subsume les femmes sous une catégorie masculine, ce qui influence les représentations et renforce l’idée que le masculin est la norme. Les oppositions au langage inclusif se réclament souvent de la tradition pour maintenir l’écriture androcentrée.',
    sources: [
      {
        titre: 'Gazette des femmes – Quand le masculin l’emporte sur le féminin',
        url: 'https://gazettedesfemmes.ca/13898/quand-le-masculin-lemporte-sur-le-feminin/'
      }
    ]
  },
  {
    id: 'effacement-femmes',
    nom: 'Effacement des femmes',
    description: 'Processus d’effacement des contributions féminines dans l’histoire, les arts, la toponymie ou la science : les biographies masculines saturent les manuels et monuments, tandis que les pionnières sont rarement citées. Ce vide mémoriel entretient l’idée que les femmes n’ont pas bâti la société.',
    sources: [
      {
        titre: 'Effacement des femmes — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Effacement_des_femmes'
      }
    ]
  },
  {
    id: 'effet-matilda',
    nom: 'Effet Matilda',
    description: 'Mécanisme par lequel des découvertes réalisées par des scientifiques femmes sont attribuées à leurs collègues masculins, comme Rosalind Franklin pour l’ADN ou Jocelyn Bell pour les pulsars. L’effet Matilda retire reconnaissance, financements et carrières aux chercheuses, nourrissant le stéréotype du génie masculin.',
    sources: [
      {
        titre: 'Effet Matilda — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Effet_Matilda'
      }
    ]
  },
  {
    id: 'regard-masculin',
    nom: 'Regard masculin',
    description: 'Concept analysé par Laura Mulvey : la caméra et le scénario traditionnels épousent le désir d’un spectateur masculin hétérosexuel. Les héroïnes deviennent des objets à contempler, ce qui légitime la sexualisation forcée et marginalise les récits centrés sur les regards féminins.',
    sources: [
      {
        titre: 'Regard masculin — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Regard_masculin'
      }
    ]
  },
  {
    id: 'test-bechdel',
    nom: 'Test de Bechdel',
    description: 'Test narratif qui interroge la présence de deux personnages féminins nommés ayant une conversation qui ne concerne pas un homme. La majorité des films grand public échouent à cette vérification, révélant que les femmes restent souvent des accessoires dans les intrigues.',
    sources: [
      {
        titre: 'Test de Bechdel — Wikipédia',
        url: 'https://fr.wikipedia.org/wiki/Test_de_Bechdel'
      }
    ]
  },
  {
    id: 'plafond-verre',
    nom: 'Plafond de verre',
    description: 'Barrières invisibles qui bloquent l’accès des femmes aux postes les mieux rémunérés ou les plus décisionnels : cooptation masculine, stéréotypes sur le leadership et pénalisation de la maternité. En France, les cadres masculins perçoivent encore davantage de primes et se voient confier les équipes les plus importantes.',
    sources: [
      {
        titre: 'Novethic – Plafond de verre',
        url: 'https://www.novethic.fr/lexique/detail/plafond-de-verre.html'
      }
    ]
  },
  {
    id: 'inegalites-salariales',
    nom: 'Inégalités salariales',
    description: 'Même à poste équivalent, les salariées touchent en moyenne un salaire fixe et variable inférieur à celui de leurs collègues masculins. L’écart médian se creuse avec l’âge et les promotions, consolidant une dépendance économique qui rejaillit sur la retraite et l’accès au patrimoine.',
    sources: [
      {
        titre: 'APEC – Inégalités salariales, plafond de verre, sexisme',
        url: 'http://corporate.apec.fr/home/actus-medias/toutes-nos-actualites/inegalites-salariales-plafond-de-verre-sexisme-les-carrieres-des-femmes-cadres-toujours-penalisees.html'
      }
    ]
  },
  {
    id: 'charge-domestique',
    nom: 'Charge domestique invisible',
    description: 'Les femmes réalisent toujours l’essentiel du travail domestique, logistique et émotionnel du foyer, même lorsqu’elles occupent un emploi à temps plein. Cette “double journée” grignote leur temps libre, limite leur progression professionnelle et demeure largement invisible dans les indicateurs économiques.',
    sources: [
      {
        titre: 'NousToutes – Comprendre les chiffres des violences sexistes',
        url: 'https://www.noustoutes.org/comprendre-les-chiffres/'
      }
    ]
  },
  {
    id: 'sous-representation-mediatique',
    nom: 'Sous-représentation médiatique',
    description: 'Dans les médias d’information, les femmes représentent moins d’un tiers des personnes mentionnées ou invitées comme expertes, et leur parole reste cantonnée aux rubriques “société” ou “vie quotidienne”. Cette sous-représentation renforce l’idée que l’autorité publique est masculine et prive l’espace médiatique de points de vue féminins.',
    sources: [
      {
        titre: 'Youmatter – Inégalités hommes-femmes dans les médias',
        url: 'https://youmatter.world/fr/categorie-societe/inegalites-hommes-femmes-medias-chiffres/'
      }
    ]
  }
];

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('origin') ?? '';
    if (origin && !isOriginAllowed(origin)) {
      return jsonResponse({ error: 'origin-not-allowed' }, 403, origin);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, true) });
    }

    try {
      return await routeRequest(request, env, origin);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonResponse({ error: error.message }, error.status, origin);
      }
      console.error('Unhandled error', error);
      return jsonResponse({ error: 'internal-error' }, 500, origin);
    }
  }
};

async function routeRequest(request: Request, env: Env, origin: string): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  if (method === 'GET' && url.pathname === '/api/argumentaires') {
    const list = await readArgumentaires(env);
    return jsonResponse(list, 200, origin, { 'content-type': 'application/json; charset=utf-8' });
  }

  if (method === 'POST' && url.pathname === '/api/argumentaires') {
    return handlePublicSubmission(request, env, origin);
  }

  if (method === 'POST' && url.pathname === '/api/admin/login') {
    return handleAdminLogin(request, env, origin);
  }

  if (url.pathname.startsWith('/api/admin/')) {
    await requireAdmin(request, env);

    if (method === 'GET' && url.pathname === '/api/admin/argumentaires') {
      const list = await readArgumentaires(env);
      return jsonResponse(list, 200, origin, { 'content-type': 'application/json; charset=utf-8' });
    }

    if (method === 'POST' && url.pathname === '/api/admin/argumentaires') {
      await handleAdminArgumentaireUpsert(request, env);
      return jsonResponse({ status: 'ok' }, 200, origin);
    }

    if (method === 'POST' && url.pathname === '/api/admin/argumentaires/delete') {
      await handleAdminArgumentaireDelete(request, env);
      return jsonResponse({ status: 'ok' }, 200, origin);
    }

    if (method === 'GET' && url.pathname === '/api/admin/phenomenes') {
      const list = await readPhenomena(env);
      return jsonResponse(list, 200, origin, { 'content-type': 'application/json; charset=utf-8' });
    }

    if (method === 'POST' && url.pathname === '/api/admin/phenomenes') {
      await handleAdminPhenomenonUpsert(request, env);
      return jsonResponse({ status: 'ok' }, 200, origin);
    }

    if (method === 'POST' && url.pathname === '/api/admin/phenomenes/delete') {
      await handleAdminPhenomenonDelete(request, env);
      return jsonResponse({ status: 'ok' }, 200, origin);
    }
  }

  return jsonResponse({ error: 'not-found' }, 404, origin);
}

async function handlePublicSubmission(request: Request, env: Env, origin: string): Promise<Response> {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  let payload: Record<string, unknown>;

  if (env.API_SHARED_SECRET) {
    const suppliedSecret = request.headers.get('x-api-key');
    if (suppliedSecret !== env.API_SHARED_SECRET) {
      throw new HttpError(401, 'unauthorized');
    }
  } else {
    const { allowed, retryAfter } = await enforceRateLimit(env, ip);
    if (!allowed) {
      const headers = corsHeaders(origin, false);
      headers['retry-after'] = String(retryAfter);
      return jsonResponse({ error: 'rate-limit' }, 429, origin, headers);
    }
  }

  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'invalid-json');
  }

  if (env.TURNSTILE_SECRET) {
    const token = typeof payload.turnstile_token === 'string' ? payload.turnstile_token : '';
    if (!(await verifyTurnstile(env.TURNSTILE_SECRET, token, ip))) {
      throw new HttpError(403, 'turnstile-verification-failed');
    }
  }

  const entry = normalizePublicEntry(payload, ip);
  if (!entry) {
    throw new HttpError(422, 'invalid-payload');
  }

  await writeArgumentaire(env, entry.item, entry.phraseKey);
  return jsonResponse({ status: 'ok' }, 201, origin);
}

async function handleAdminLogin(request: Request, env: Env, origin: string): Promise<Response> {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'invalid-json');
  }
  const password = typeof payload.password === 'string' ? payload.password.trim() : '';
  if (!password) {
    throw new HttpError(400, 'password-required');
  }
  const hash = await sha256Hex(password);
  if (hash !== ADMIN_PASSWORD_HASH) {
    throw new HttpError(401, 'invalid-credentials');
  }
  const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  await env.KV_ARGUMENTAIRES.put(TOKEN_PREFIX + token, '1', { expirationTtl: ADMIN_TOKEN_TTL_SECONDS });
  return jsonResponse({ token }, 200, origin);
}

async function requireAdmin(request: Request, env: Env): Promise<void> {
  const token = request.headers.get('x-admin-token')?.trim() ?? '';
  if (!token) {
    throw new HttpError(401, 'missing-token');
  }
  const key = TOKEN_PREFIX + token;
  const exists = await env.KV_ARGUMENTAIRES.get(key);
  if (!exists) {
    throw new HttpError(401, 'invalid-token');
  }
  await env.KV_ARGUMENTAIRES.put(key, '1', { expirationTtl: ADMIN_TOKEN_TTL_SECONDS });
}

async function handleAdminArgumentaireUpsert(request: Request, env: Env): Promise<void> {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'invalid-json');
  }
  const phrase = typeof payload.name === 'string' ? payload.name.trim() : '';
  const argumentaire = typeof payload.content === 'string' ? payload.content.trim() : '';
  if (!phrase || !argumentaire) {
    throw new HttpError(400, 'invalid-payload');
  }
  const sources = normalizeSources(payload.sources);
  const entry: ArgumentaireItem = {
    phrase,
    argumentaire,
    sources: sources.length ? sources : undefined,
    updated_at: new Date().toISOString()
  };
  await writeArgumentaire(env, entry, phrase.toLowerCase());
}

async function handleAdminArgumentaireDelete(request: Request, env: Env): Promise<void> {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'invalid-json');
  }
  const phrase = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!phrase) {
    throw new HttpError(400, 'invalid-payload');
  }
  const items = await readArgumentaires(env);
  const remaining = items.filter(item => item.phrase !== phrase);
  await env.KV_ARGUMENTAIRES.put(ARGUMENTAIRES_KEY, JSON.stringify(remaining));
}

async function handleAdminPhenomenonUpsert(request: Request, env: Env): Promise<void> {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'invalid-json');
  }
  const nom = typeof payload.name === 'string' ? payload.name.trim() : '';
  const description = typeof payload.content === 'string' ? payload.content.trim() : '';
  if (!nom || !description) {
    throw new HttpError(400, 'invalid-payload');
  }
  const sources = normalizeSources(payload.sources);
  const existing = (await readPhenomena(env)).find(item => item.nom === nom);
  const phenomenon: PhenomenonItem = {
    id: existing?.id ?? slugify(nom),
    nom,
    description,
    sources: sources.length ? sources : undefined
  };
  await writePhenomena(env, phenomenon);
}

async function handleAdminPhenomenonDelete(request: Request, env: Env): Promise<void> {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'invalid-json');
  }
  const nom = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!nom) {
    throw new HttpError(400, 'invalid-payload');
  }
  const list = await readPhenomena(env);
  const remaining = list.filter(item => item.nom !== nom);
  await env.KV_ARGUMENTAIRES.put(PHENOMENES_KEY, JSON.stringify(remaining));
}

async function writeArgumentaire(env: Env, item: ArgumentaireItem, phraseKey: string): Promise<void> {
  const items = await readArgumentaires(env);
  const filtered = items.filter(existing => existing.phrase.toLowerCase() !== phraseKey);
  filtered.push(item);
  filtered.sort((a, b) => a.phrase.localeCompare(b.phrase, 'fr', { sensitivity: 'base' }));
  await env.KV_ARGUMENTAIRES.put(ARGUMENTAIRES_KEY, JSON.stringify(filtered));
}

async function writePhenomena(env: Env, item: PhenomenonItem): Promise<void> {
  const list = await readPhenomena(env);
  const filtered = list.filter(existing => existing.nom !== item.nom);
  filtered.push(item);
  filtered.sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
  await env.KV_ARGUMENTAIRES.put(PHENOMENES_KEY, JSON.stringify(filtered));
}

async function readPhenomena(env: Env): Promise<PhenomenonItem[]> {
  const raw = await env.KV_ARGUMENTAIRES.get(PHENOMENES_KEY);
  if (!raw) {
    return [...DEFAULT_PHENOMENES];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_PHENOMENES];
    }
    const cleaned = parsed
      .map(value => normalizePhenomenon(value))
      .filter((item): item is PhenomenonItem => Boolean(item));
    return cleaned.length ? cleaned : [...DEFAULT_PHENOMENES];
  } catch (error) {
    console.warn('Impossible de parser les phénomènes en KV', error);
    return [...DEFAULT_PHENOMENES];
  }
}

function normalizePhenomenon(value: unknown): PhenomenonItem | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const nom = typeof record.nom === 'string' ? record.nom : '';
  const description = typeof record.description === 'string' ? record.description : '';
  if (!nom || !description) return null;
  const id = typeof record.id === 'string' && record.id ? record.id : slugify(nom);
  const sources = normalizeSources(record.sources, false);
  return {
    id,
    nom,
    description,
    sources: sources.length ? sources : undefined
  };
}

function normalizeSources(raw: unknown, strict = true): SourceItem[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    if (strict) {
      throw new HttpError(400, 'sources-invalid');
    }
    return [];
  }
  const sources: SourceItem[] = [];
  for (const entry of raw.slice(0, MAX_SOURCES)) {
    if (!entry || typeof entry !== 'object') {
      if (strict) {
        throw new HttpError(400, 'sources-invalid');
      }
      continue;
    }
    const record = entry as Record<string, unknown>;
    const titre = typeof record.titre === 'string' ? record.titre.trim() : '';
    const auteur = typeof record.auteur === 'string' ? record.auteur.trim() : '';
    const url = typeof record.url === 'string' ? record.url.trim() : '';
    if (!titre && !auteur && !url) {
      continue;
    }
    if (url && !isSafeUrl(url)) {
      continue;
    }
    const source: SourceItem = {};
    if (titre) source.titre = titre;
    if (auteur) source.auteur = auteur;
    if (url) source.url = url;
    sources.push(source);
  }
  return sources;
}

function normalizePublicEntry(value: Record<string, unknown> | null | undefined, ip: string): { item: ArgumentaireItem; phraseKey: string } | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const phrase = typeof value.phrase === 'string' ? value.phrase.trim() : '';
  const argumentaire = typeof value.argumentaire === 'string' ? value.argumentaire.trim() : '';
  if (!phrase || !argumentaire) {
    return null;
  }
  const sources = normalizeSources(value.sources, false);
  const item: ArgumentaireItem = {
    phrase,
    argumentaire,
    sources: sources.length ? sources : undefined,
    updated_at: new Date().toISOString(),
    ip_hash: hashIp(ip)
  };
  return { item, phraseKey: phrase.toLowerCase() };
}

function normalizeStoredArgumentaire(value: unknown): ArgumentaireItem | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const phrase = typeof record.phrase === 'string' ? record.phrase : '';
  const argumentaire = typeof record.argumentaire === 'string' ? record.argumentaire : '';
  if (!phrase || !argumentaire) return null;
  const sources = normalizeSources(record.sources, false);
  const updatedAt = typeof record.updated_at === 'string' ? record.updated_at : new Date().toISOString();
  const ipHash = typeof record.ip_hash === 'string' ? record.ip_hash : undefined;
  return {
    phrase,
    argumentaire,
    sources: sources.length ? sources : undefined,
    updated_at: updatedAt,
    ip_hash: ipHash
  };
}

async function readArgumentaires(env: Env): Promise<ArgumentaireItem[]> {
  const raw = await env.KV_ARGUMENTAIRES.get(ARGUMENTAIRES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const cleaned = parsed
      .map(item => normalizeStoredArgumentaire(item))
      .filter((item): item is ArgumentaireItem => Boolean(item));
    cleaned.sort((a, b) => a.phrase.localeCompare(b.phrase, 'fr', { sensitivity: 'base' }));
    return cleaned;
  } catch (error) {
    console.warn('Impossible de parser la base en KV', error);
    return [];
  }
}

async function enforceRateLimit(env: Env, ip: string): Promise<{ allowed: boolean; retryAfter: number }> {
  const windowId = new Date().toISOString().slice(0, 16);
  const bucket = `${RATE_LIMIT_PREFIX}:${windowId}:${ip}`;
  const existing = await env.KV_ARGUMENTAIRES.get(bucket);
  const currentCount = existing ? Number(existing) : 0;
  if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: RATE_LIMIT_BUCKET_SECONDS };
  }
  await env.KV_ARGUMENTAIRES.put(bucket, String(currentCount + 1), { expirationTtl: RATE_LIMIT_BUCKET_SECONDS });
  return { allowed: true, retryAfter: 0 };
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  formData.append('remoteip', ip);
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      console.warn('Turnstile verification failed', response.status, await response.text());
      return false;
    }
    const data = (await response.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (error) {
    console.warn('Turnstile verification failed', error);
    return false;
  }
}

function corsHeaders(origin: string, isPreflight = false): Record<string, string> {
  const allowed = origin && isOriginAllowed(origin) ? origin : '*';
  const headers: Record<string, string> = {
    'access-control-allow-origin': allowed,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-admin-token, x-api-key',
    vary: 'Origin'
  };
  if (isPreflight) {
    headers['access-control-max-age'] = '86400';
  }
  return headers;
}

function jsonResponse(body: unknown, status: number, origin: string, extraHeaders: Record<string, string> = {}): Response {
  const headers = {
    ...corsHeaders(origin, false),
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extraHeaders
  };
  return new Response(JSON.stringify(body), { status, headers });
}

function isOriginAllowed(origin: string): boolean {
  if (!origin) {
    return false;
  }
  const normalized = origin.toLowerCase();
  if (STATIC_ALLOWED_ORIGINS.has(normalized)) {
    return true;
  }
  try {
    const url = new URL(normalized);
    return FLEXIBLE_ALLOWED_SUFFIXES.some(suffix => url.hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function hashIp(ip: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  let hash = 0;
  for (const byte of data) {
    hash = (hash * 31 + byte) >>> 0;
  }
  return hash.toString(16);
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || crypto.randomUUID();
}
