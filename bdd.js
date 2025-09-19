(function () {
  'use strict';

  const FALLBACK_DATA = [
    {
      phrase: "Sois un homme",
      argumentaire: "Cette injonction repose sur la masculinité hégémonique, restreint l'expression émotionnelle et favorise des comportements à risque.",
      sources: [
        {
          titre: "Masculinities",
          auteur: "R.W. Connell",
          url: "https://genderandmasculinities.files.wordpress.com/2017/02/robert-w-connell-masculinities-second-edition-3.pdf"
        },
        {
          titre: "WHO: Challenging harmful masculinities",
          url: "https://www.who.int/news/item/12-04-2024-challenging-harmful-masculinities-and-engaging-men-and-boys-in-sexual-and-reproductive-health"
        }
      ]
    },
    {
      phrase: "Les hommes ne pleurent pas",
      argumentaire: "Refouler les émotions encourage anxiété et dépression ; les différences ne sont pas biologiques mais culturelles.",
      sources: [
        {
          titre: "Toward the reconstruction of masculinity",
          auteur: "Levant",
          url: "https://www.semanticscholar.org/paper/Toward-the-reconstruction-of-masculinity-Levant/bd992654a9ed4ee80c128b2c97ef47da9acc2eb7"
        }
      ]
    },
    {
      phrase: "Pas tous les hommes",
      argumentaire: "Occulte le caractère structurel des violences de genre documenté par l’ONU et l’INSEE.",
      sources: [
        {
          titre: "Man Enough: Donald Trump...",
          auteur: "Katz",
          url: "https://www.mediaed.org/why-are-so-many-young-male-voters-gravitating-toward-donald-trump/"
        }
      ]
    },
    {
      phrase: "Les féministes détestent les hommes",
      argumentaire: "Stéréotype infondé ; les féminismes visent l’égalité et incluent les hommes comme alliés.",
      sources: [
        {
          titre: "Backlash: The Undeclared War Against American Women",
          auteur: "Faludi",
          url: "https://books.google.com/books/about/Backlash.html?id=GfDa1cdeHT0C"
        },
        {
          titre: "Backlash PDF",
          url: "https://seminariolecturasfeministas.files.wordpress.com/2012/01/faludi-susan-backlash-the-undeclared-war-against-american-women.pdf"
        }
      ]
    },
    {
      phrase: "On ne peut plus rien dire",
      argumentaire: "Réaction à la remise en cause des privilèges discursifs, pas une atteinte à la liberté d’expression.",
      sources: [
        {
          titre: "Fortunes Of Feminism",
          auteur: "Nancy Fraser",
          url: "https://archive.org/details/fortunes-of-feminism-from-state-managed-capitalism-to-neoliberal-crisis-by-nancy-fraser-2013"
        }
      ]
    },
    {
      phrase: "C'était pour rire",
      argumentaire: "L’humour sexiste banalise et entretient les discriminations.",
      sources: [
        {
          titre: "Social consequences of disparagement humor",
          auteur: "Ford & Ferguson",
          url: "https://pubmed.ncbi.nlm.nih.gov/15121541/"
        },
        {
          titre: "PDF: Social consequences humor",
          url: "https://www.academia.edu/72723461/The_social_consequences_of_disparagement_humor_Introduction_and_overview"
        }
      ]
    },
    {
      phrase: "Elle l'a cherché",
      argumentaire: "Mythe du viol, culpabilise la victime, démenti par toutes les enquêtes.",
      sources: [
        {
          titre: "Using social norms to reduce men's rape proclivity",
          url: "https://kar.kent.ac.uk/26184/1/Bohner%20Pina%20Viki%20Siebler%202010%20PCL%20final-MS.pdf"
        },
        {
          titre: "The moderating role of gender and rape myth acceptance",
          url: "https://core.ac.uk/download/pdf/15980425.pdf"
        }
      ]
    },
    {
      phrase: "Les femmes sont trop émotives",
      argumentaire: "Aucune base biologique ; c’est une construction sociale.",
      sources: [
        {
          titre: "Delusions of Gender",
          auteur: "Cordelia Fine",
          url: "https://www.worldcat.org/title/664669074"
        },
        {
          titre: "The Gendered Brain",
          auteur: "Gina Rippon",
          url: "https://www.worldcat.org/title/1037896125"
        }
      ]
    },
    {
      phrase: "Les quotas, c'est injuste",
      argumentaire: "Les quotas corrigent les inégalités et améliorent la représentation.",
      sources: [
        {
          titre: "Feminist Trouble: Intersectional Politics",
          auteur: "Lépinard",
          url: "https://www.worldcat.org/title/1119478787"
        },
        {
          titre: "Women, Politics, and Power",
          auteur: "Paxton & Hughes",
          url: "https://www.worldcat.org/title/861693778"
        }
      ]
    },
    {
      phrase: "La galanterie prouve le respect",
      argumentaire: "C’est du sexisme bienveillant qui maintient la domination sous couvert de protection.",
      sources: [
        {
          titre: "The Ambivalent Sexism Inventory",
          auteur: "Glick & Fiske",
          url: "https://www.researchgate.net/publication/14295473_The_Ambivalent_Sexism_Inventory"
        }
      ]
    },
    {
      phrase: "La drague lourde, c'est normal",
      argumentaire: "La drague lourde est une forme de harcèlement ; elle nie le consentement.",
      sources: [
        {
          titre: "Surviving Sexual Violence",
          auteur: "Kelly",
          url: "https://www.worldcat.org/title/12865167"
        },
        {
          titre: "La construction du masculin",
          auteur: "Welzer-Lang",
          url: "https://www.worldcat.org/title/798875797"
        }
      ]
    },
    {
      phrase: "Les mères sont faites pour ça",
      argumentaire: "La maternité est une construction sociale non un instinct.",
      sources: [
        {
          titre: "L’amour en plus",
          auteur: "Badinter",
          url: "https://www.worldcat.org/title/70236147"
        },
        {
          titre: "La femme seule et le prince charmant",
          auteur: "Kaufmann",
          url: "https://www.worldcat.org/title/40987290"
        }
      ]
    },
    {
      phrase: "Le viol, c'est rare",
      argumentaire: "Les chiffres montrent que c’est un phénomène massif et sous-déclaré.",
      sources: [
        {
          titre: "ENVEFF",
          url: "https://www.ined.fr/fr/tout-savoir-population/chiffres/france/enveff-violences-femmes/"
        },
        {
          titre: "Virage INED",
          url: "https://www.ined.fr/fr/recherche/recherche-multi-thematique/enquete-virage/"
        }
      ]
    },
    {
      phrase: "La charge mentale n'existe pas",
      argumentaire: "Le concept existe, théorisé et vérifié par enquêtes INSEE.",
      sources: [
        {
          titre: "Haicault. La gestion ordinaire de la vie en deux",
          url: "https://www.worldcat.org/title/759608026"
        },
        {
          titre: "INSEE Emploi du temps",
          url: "https://www.insee.fr/fr/statistiques/4797750"
        }
      ]
    },
    {
      phrase: "Les féminicides, mot militant",
      argumentaire: "Reconnu internationalement et dans les politiques publiques.",
      sources: [
        {
          titre: "ONU Handbook on Violence against Women",
          url: "https://www.unwomen.org/en/digital-library/publications/2009/07/handbook-for-legislation-on-violence-against-women"
        },
        {
          titre: "Ministère Intérieur étude féminicides",
          url: "https://www.interieur.gouv.fr/actualites/communiques/feminicides-les-chiffres-cles"
        }
      ]
    },
    {
      phrase: "On a déjà l'égalité",
      argumentaire: "Les rapports internationaux montrent de nombreux écarts persistants.",
      sources: [
        {
          titre: "Global Gender Gap Report 2022",
          url: "https://www.weforum.org/reports/global-gender-gap-report-2022"
        },
        {
          titre: "INSEE Inégalités femmes-hommes",
          url: "https://www.insee.fr/fr/statistiques/2662545"
        }
      ]
    },
    {
      phrase: "Les femmes conduisent mal",
      argumentaire: "Les données montrent que les hommes causent la majorité des accidents mortels.",
      sources: [
        {
          titre: "ONISR 2021 sécurité routière",
          url: "https://www.onisr.securite-routiere.gouv.fr/sites/default/files/2022-06/Bilan-consolid%C3%A9-accidentalit%C3%A9-2021-def.pdf"
        }
      ]
    },
    {
      phrase: "Garçon manqué",
      argumentaire: "Ce terme sanctionne l’écart au genre ; la spécialisation des rôles est sociale, non naturelle.",
      sources: [
        {
          titre: "Duru-Bellat, division sexuée des filières",
          url: "https://hal.science/hal-01469347/document"
        }
      ]
    },
    {
      phrase: "Elle exagère",
      argumentaire: "Minimiser ou accuser d’exagération est du gaslighting ; la tendance générale est à la sous-déclaration.",
      sources: [
        {
          titre: "Turning up the lights on gaslighting",
          auteur: "Abramson",
          url: "https://philarchive.org/archive/ABRTUT"
        }
      ]
    },
    {
      phrase: "Friendzone",
      argumentaire: "Concept qui crée une dette sexuelle imaginaire ; favorise l’objectification.",
      sources: [
        {
          titre: "Sexual economics",
          auteur: "Baumeister & Vohs",
          url: "https://www.researchgate.net/publication/51963329_Sexual_Economics_A_Comparison_of_Sex_Money_and"
        }
      ]
    },
    {
      phrase: "Si elle dit non, c'est oui",
      argumentaire: "Mythe rigoureusement déconstruit : seul le consentement explicite compte.",
      sources: [
        {
          titre: "Using social norms to reduce men's rape proclivity",
          url: "https://kar.kent.ac.uk/26184/1/Bohner%20Pina%20Viki%20Siebler%202010%20PCL%20final-MS.pdf"
        }
      ]
    },
    {
      phrase: "Le harcèlement, c'est subjectif",
      argumentaire: "Définition juridique et médicale objective ; effet prouvé sur la santé.",
      sources: [
        {
          titre: "Einarsen, Harassment at Work",
          url: "https://www.cambridge.org/core/books/harassment-bullying-and-violence-at-work/E17FE178073D689B7D6637FF9B747E3A"
        }
      ]
    },
    {
      phrase: "Les règles, ce n'est pas un sujet",
      argumentaire: "La menstruation est un enjeu de santé, l’occultation aggrave les inégalités.",
      sources: [
        {
          titre: "UNESCO: Menstrual Health & School",
          url: "https://unesdoc.unesco.org/ark:/48223/pf0000233576"
        }
      ]
    },
    {
      phrase: "C'est un compliment",
      argumentaire: "Commentaires non désirés réduisent à l’apparence et sont vécus comme oppressifs.",
      sources: [
        {
          titre: "Street harassment article",
          auteur: "Bowman",
          url: "https://scholarship.law.cornell.edu/cgi/viewcontent.cgi?article=1394&context=clr"
        }
      ]
    },
    {
      phrase: "Le consentement tue la séduction",
      argumentaire: "Le consentement explicite renforce le respect mutuel et la qualité de la séduction.",
      sources: [
        {
          titre: "College students and sexual consent",
          auteur: "Jozkowski & Peterson",
          url: "https://www.tandfonline.com/doi/full/10.1080/00224499.2013.772872"
        }
      ]
    },
    {
      phrase: "La parité baisse le niveau",
      argumentaire: "La parité améliore la performance des groupes et entreprises.",
      sources: [
        {
          titre: "Women Matter McKinsey",
          url: "https://www.mckinsey.com/featured-insights/diversity-and-inclusion/women-matter"
        }
      ]
    },
    {
      phrase: "Nature masculine violente",
      argumentaire: "Aucune preuve biologique ; la violence est contextuelle.",
      sources: [
        {
          titre: "Masculinities",
          auteur: "Connell",
          url: "https://genderandmasculinities.files.wordpress.com/2017/02/robert-w-connell-masculinities-second-edition-3.pdf"
        },
        {
          titre: "Sex differences in aggression",
          auteur: "Archer",
          url: "https://www.researchgate.net/publication/26646340_Does_sexual_selection_explain_human_sex_differences_in_aggression"
        }
      ]
    },
    {
      phrase: "C'est la biologie",
      argumentaire: "La plasticité cérébrale et le contexte social expliquent les différences.",
      sources: [
        {
          titre: "Delusions of Gender",
          auteur: "Fine",
          url: "https://www.worldcat.org/title/664669074"
        },
        {
          titre: "Gendered Brain",
          auteur: "Rippon",
          url: "https://www.worldcat.org/title/1037896125"
        }
      ]
    },
    {
      phrase: "Elle ment pour nuire",
      argumentaire: "Les fausses accusations sont rares, bien moins nombreuses que les cas non déclarés.",
      sources: [
        {
          titre: "ONS false allegations stats",
          url: "https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice/articles/sexualoffendingvictimsandthecriminaljusticesystem/november2020"
        },
        {
          titre: "INED Violences et rapports de genre",
          url: "https://www.ined.fr/fr/recherche/recherche-multi-thematique/enquete-virage/"
        }
      ]
    }
  ];

  let db = new Map(
    FALLBACK_DATA.map(item => [item.phrase, { argumentaire: item.argumentaire, sources: item.sources || [] }])
  );

  const form = document.getElementById('argForm');
  const tableBody = document.querySelector('#argTable tbody');
  const submitBtn = form?.querySelector('button[type="submit"]') || null;
  const sourcesInput = document.getElementById('sources');

  if (!form || !tableBody || !submitBtn || !sourcesInput) {
    console.error('Structure inattendue sur bdd.html: formulaire ou tableau manquant.');
    return;
  }

  const turnstileContainer = document.getElementById('turnstile-container');
  const turnstileWidget = turnstileContainer?.querySelector('.cf-turnstile') || null;
  const turnstileSiteKey = (turnstileWidget?.getAttribute('data-sitekey') || '').trim();
  const turnstileConfigured = Boolean(turnstileSiteKey && turnstileSiteKey !== 'YOUR_TURNSTILE_SITE_KEY');

  if (!turnstileConfigured && turnstileContainer) {
    console.warn('Turnstile site key manquant : formulaire mis en lecture seule.');
    const warning = document.createElement('p');
    warning.className = 'turnstile-warning';
    warning.textContent = 'Le contrôle anti-robot n’est pas configuré. Les soumissions sont désactivées jusqu’à mise à jour du site key Turnstile.';
    turnstileContainer.replaceChildren(warning);
  }

  const WORKER_ENDPOINTS = Object.freeze({
    prod: 'https://workers-argumentaires.mehdi-guiraud.workers.dev',
    dev: 'https://workers-argumentaires-dev.mehdi-guiraud.workers.dev'
  });

  const API_BASE = resolveApiBase();

  function resolveApiBase() {
    const override = pickFirstDefined([
      typeof window !== 'undefined' ? window.ARGUMENTAIRES_API_URL : undefined,
      document.documentElement?.getAttribute('data-api-base'),
      document.body?.dataset?.apiBase,
      document.querySelector('meta[name="argumentaires-api"]')?.content
    ]);
    if (override) {
      return sanitizeApiBase(override);
    }

    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
    if (host.endsWith('.workers.dev')) {
      return '';
    }
    const firstLabel = host.split('.')[0];
    if (host.includes('gitlab.io') || firstLabel === 'dev' || firstLabel === 'staging' || firstLabel.endsWith('-dev') || firstLabel.endsWith('-staging') || firstLabel.endsWith('-preview')) {
      return WORKER_ENDPOINTS.dev;
    }
    return WORKER_ENDPOINTS.prod;
  }

  function sanitizeApiBase(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    try {
      const url = new URL(trimmed, window.location.origin);
      const cleanPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
      return `${url.origin}${cleanPath}`;
    } catch (_) {
      return trimmed.replace(/\/$/, '');
    }
  }

  function pickFirstDefined(values) {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
    return undefined;
  }

  function apiUrl(path) {
    if (!API_BASE) {
      return path;
    }
    return `${API_BASE}${path}`;
  }

  async function loadData() {
    try {
      const res = await fetch(apiUrl('/api/argumentaires'));
      if (!res.ok) throw new Error(`Statut ${res.status}`);
      const items = await res.json();
      if (!Array.isArray(items)) throw new Error('Format inattendu');
      const cleanItems = items.filter(item => item && item.phrase);
      if (cleanItems.length) {
        const merged = new Map(
          FALLBACK_DATA.map(item => [
            item.phrase,
            { argumentaire: item.argumentaire, sources: item.sources || [] }
          ])
        );
        cleanItems.forEach(item => {
          merged.set(item.phrase, {
            argumentaire: item.argumentaire,
            sources: Array.isArray(item.sources) ? item.sources : []
          });
        });
        db = merged;
        renderTable();
        return;
      }
    } catch (err) {
      console.warn('Impossible de lire la base SQLite, chargement des données intégrées.', err);
    }
    db = new Map(
      FALLBACK_DATA.map(item => [item.phrase, { argumentaire: item.argumentaire, sources: item.sources || [] }])
    );
    renderTable();
  }

  function renderTable() {
    tableBody.innerHTML = '';
    const rows = Array.from(db.entries()).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
    for (const [phrase, data] of rows) {
      const tr = document.createElement('tr');

      const tdPhrase = document.createElement('td');
      tdPhrase.textContent = phrase;
      tr.appendChild(tdPhrase);

      const tdArg = document.createElement('td');
      tdArg.textContent = data.argumentaire;
      tr.appendChild(tdArg);

      const tdSources = document.createElement('td');
      if (data.sources && data.sources.length) {
        const list = document.createElement('ul');
        data.sources.forEach(src => {
          const li = document.createElement('li');
          const titre = src.titre || 'Source';
          const auteur = src.auteur ? ` (${src.auteur})` : '';
          if (src.url) {
            const link = document.createElement('a');
            link.href = src.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = titre;
            li.appendChild(link);
          } else {
            li.textContent = titre;
          }
          if (auteur) {
            li.appendChild(document.createTextNode(auteur));
          }
          list.appendChild(li);
        });
        tdSources.appendChild(list);
      } else {
        tdSources.textContent = '—';
      }
      tr.appendChild(tdSources);

      tableBody.appendChild(tr);
    }
  }

  function parseSources(raw) {
    const text = raw.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(entry => entry && (entry.titre || entry.url))
          .map(entry => ({
            ...(entry.titre ? { titre: entry.titre } : {}),
            ...(entry.auteur ? { auteur: entry.auteur } : {}),
            ...(entry.url ? { url: entry.url } : {})
          }));
      }
    } catch (err) {
      // contenu non JSON, on tente le format ligne par ligne
    }
    return text.split(/\n+/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(/\s*(?:-|\|)\s*/, 2);
        const titre = parts[0];
        const url = parts[1];
        const entry = {};
        if (titre) entry.titre = titre;
        if (url) entry.url = url;
        return entry;
      })
      .filter(entry => entry.titre || entry.url);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const phrase = document.getElementById('phrase').value.trim();
    const arg = document.getElementById('argumentaire').value.trim();
    if (!phrase || !arg) return;

    const sources = parseSources(sourcesInput.value || '');

    if (!turnstileConfigured) {
      alert('Le contrôle anti-robot n’est pas configuré sur cet environnement.');
      return;
    }

    const turnstileToken = window.turnstile?.getResponse?.(turnstileWidget) || '';
    if (!turnstileToken) {
      alert('Veuillez valider le contrôle anti-robot.');
      return;
    }

    submitBtn.disabled = true;
    try {
      const res = await fetch(apiUrl('/api/argumentaires'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, argumentaire: arg, sources, turnstile_token: turnstileToken })
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        const message = detail.error ? String(detail.error) : `Erreur ${res.status}`;
        throw new Error(message);
      }
      db.set(phrase, { argumentaire: arg, sources });
      form.reset();
      window.turnstile?.reset?.();
      renderTable();
    } catch (err) {
      console.error('Sauvegarde impossible', err);
      alert(err.message.includes('rate-limit') ? 'Vous envoyez trop rapidement. Merci de patienter avant une nouvelle soumission.' : "Impossible d'enregistrer dans la base. Voir la console pour les détails.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  loadData();

})();
