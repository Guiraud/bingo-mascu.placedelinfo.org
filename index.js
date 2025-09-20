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

  const PATRIARCHAL_PHENOMENA = [
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
      id: 'langue-masculine',
      nom: 'Langue à générique masculin',
      description: 'Norme grammaticale édictée au XVIIe siècle stipulant que “le masculin l’emporte”, transformant le masculin en pseudo-neutre. Ce biais linguistique invisibilise les femmes dans les discours publics et alimente la résistance à la féminisation des titres ou à l’écriture inclusive.',
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

  const PHENOMENA_BY_ID = new Map(PATRIARCHAL_PHENOMENA.map(item => [item.id, item]));
  let PHRASES = FALLBACK_DATA.map(item => item.phrase);

  let ARGUMENTAIRES = Object.fromEntries(
    FALLBACK_DATA.map(item => [item.phrase, item.argumentaire])
  );
  let ARG_SOURCES = Object.fromEntries(
    FALLBACK_DATA.map(item => [item.phrase, item.sources || []])
  );

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

  const boardEl = document.getElementById('board');
  const statsEl = document.getElementById('stats');
  const detailsEl = document.getElementById('details');
  const detailsHome = detailsEl.parentElement;
  const detailsHomeNextSibling = detailsEl.nextElementSibling;
  const newBtn = document.getElementById('new');
  const clearBtn = document.getElementById('clear');
  const copyBtn = document.getElementById('copy');
  const sizeSel = document.getElementById('size');
  const contextInput = document.getElementById('contextInput');
  const detailEmbedQuery = window.matchMedia('(min-width: 900px)');

  let size = parseInt(sizeSel.value, 10);
  let lastDetailHTML = '';
  let lastBingoText = '';
  let boardMatrix = [];
  let playableCellCount = size * size;

  function randomBetween(min, max) {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    if (high < low) return low;
    return Math.floor(Math.random() * (high - low + 1)) + low;
  }

  function moveDetailsHome() {
    detailsEl.classList.remove('board-details');
    if (detailsEl.parentElement !== detailsHome) {
      if (detailsHomeNextSibling && detailsHomeNextSibling.parentElement === detailsHome) {
        detailsHome.insertBefore(detailsEl, detailsHomeNextSibling);
      } else {
        detailsHome.appendChild(detailsEl);
      }
    }
  }

  function setDetails(html, { persist = true } = {}) {
    detailsEl.innerHTML = html;
    if (persist) {
      lastDetailHTML = html;
    }
  }

  function renderDefaultDetails() {
    setDetails('<h2>Argumentaire</h2><p>Sélectionnez une case pour voir l\'explication et la contre-argumentation basée sur la littérature et études scientifiques.</p>');
  }

  function restoreLastDetails() {
    if (lastDetailHTML) {
      detailsEl.innerHTML = lastDetailHTML;
    } else {
      renderDefaultDetails();
    }
  }

  function renderPhenomenonDetails(phenomenon, { transient = false } = {}) {
    if (!phenomenon) return;
    const list = (phenomenon.sources || []).map(src => {
      const titre = src.titre || 'Source';
      const auteur = src.auteur ? ` (${src.auteur})` : '';
      const link = src.url ? `<a href="${src.url}" target="_blank" rel="noopener">${titre}</a>` : titre;
      return `<li>${link}${auteur}</li>`;
    }).join('');
    const sourcesHtml = list ? `<h3>Sources</h3><ul>${list}</ul>` : '';
    const html = `<h2>${phenomenon.nom}</h2><p>${phenomenon.description}</p>${sourcesHtml}`;
    setDetails(html, { persist: !transient });
  }

  function addGlitterFrame(slot) {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'board-stars';
    const STAR_COUNT = 80;
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('span');
      star.className = 'board-star';
      const side = Math.floor(Math.random() * 4);
      const offset = Math.random() * 100;
      switch (side) {
        case 0:
          star.style.top = '-8px';
          star.style.left = `${offset}%`;
          break;
        case 1:
          star.style.right = '-8px';
          star.style.top = `${offset}%`;
          break;
        case 2:
          star.style.bottom = '-8px';
          star.style.left = `${offset}%`;
          break;
        default:
          star.style.left = '-8px';
          star.style.top = `${offset}%`;
          break;
      }
      star.style.animationDelay = `${(Math.random() * 2).toFixed(2)}s`;
      star.style.animationDuration = `${(1.5 + Math.random()).toFixed(2)}s`;
      starsContainer.appendChild(star);
    }
    slot.appendChild(starsContainer);
  }

  function rngShuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function takePhrases(n, useFreeCenter) {
    const pool = rngShuffle(PHRASES);
    const need = n - (useFreeCenter ? 1 : 0);
    return pool.slice(0, need);
  }

  function buildBoard() {
    size = parseInt(sizeSel.value, 10);
    const useFree = false;
    const totalCells = size * size;
    const detailConfig = size === 5
      ? { rows: [1, 2, 3], cols: [1, 2, 3], area: '2 / 2 / span 3 / span 3' }
      : size === 4
        ? { rows: [1, 2], cols: [1, 2], area: '2 / 2 / span 2 / span 2' }
        : size === 3
          ? { rows: [1], cols: [1], area: '2 / 2 / span 1 / span 1' }
          : null;
    const embedDetail = detailConfig && detailEmbedQuery.matches;
    const effectiveDetail = embedDetail ? detailConfig : null;
    const detailSlotCount = effectiveDetail ? effectiveDetail.rows.length * effectiveDetail.cols.length : 0;
    const availableSlots = totalCells - detailSlotCount;
    playableCellCount = availableSlots;
    const picked = takePhrases(availableSlots, useFree);
    renderDefaultDetails();
    moveDetailsHome();
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardMatrix = Array.from({ length: size }, () => Array(size).fill(null));

    let detailSlotElement = null;
    if (effectiveDetail) {
      detailSlotElement = document.createElement('div');
      detailSlotElement.className = 'board-detail-slot';
      detailSlotElement.style.gridArea = effectiveDetail.area;
      addGlitterFrame(detailSlotElement);
      const detailWrapper = document.createElement('div');
      detailWrapper.className = 'board-detail-wrapper';
      detailWrapper.appendChild(detailsEl);
      detailSlotElement.appendChild(detailWrapper);
      boardEl.appendChild(detailSlotElement);
      detailsEl.classList.add('board-details');
    }

    const detailSkip = effectiveDetail
      ? new Set(effectiveDetail.rows.flatMap(r => effectiveDetail.cols.map(c => `${r}-${c}`)))
      : null;
    const phenMaxBase = Math.min(embedDetail ? 6 : 5, availableSlots);
    const phenMinBase = Math.min(embedDetail ? 3 : 2, availableSlots);
    const phenMin = phenMaxBase > 0 ? Math.max(1, Math.min(phenMinBase, phenMaxBase)) : 0;
    const phenMax = phenMaxBase;
    const desiredPhenomenaCount = phenMax > 0 ? Math.min(randomBetween(phenMin, phenMax), PATRIARCHAL_PHENOMENA.length) : 0;
    const indicesPool = rngShuffle(Array.from({ length: availableSlots }, (_, i) => i));
    const selectedIndices = new Set(indicesPool.slice(0, desiredPhenomenaCount));
    const selectedPhenomena = rngShuffle(PATRIARCHAL_PHENOMENA).slice(0, selectedIndices.size);
    const phenomenaByIndex = new Map();
    Array.from(selectedIndices).forEach((slotIdx, idx) => {
      phenomenaByIndex.set(slotIdx, selectedPhenomena[idx]);
    });

    let slotIndex = 0;
    let phraseIndex = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (detailSkip && detailSkip.has(`${r}-${c}`)) {
          continue;
        }
        const isCenter = useFree && r === Math.floor(size / 2) && c === Math.floor(size / 2);
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'cell' + (isCenter ? ' free marked' : '');
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-pressed', isCenter ? 'true' : 'false');
        cell.style.gridRow = `${r + 1}`;
        cell.style.gridColumn = `${c + 1}`;
        const label = document.createElement('div');
        label.className = 'label';
        const phenomenon = phenomenaByIndex.get(slotIndex) || null;
        if (phenomenon) {
          label.textContent = phenomenon.nom;
          cell.dataset.cellType = 'phenomenon';
          cell.dataset.phenomenonId = phenomenon.id;
          cell.__phenomenon = phenomenon;
          cell.classList.add('phenomenon-cell');
          cell.addEventListener('mouseenter', () => renderPhenomenonDetails(phenomenon, { transient: true }));
          cell.addEventListener('mouseleave', restoreLastDetails);
        } else {
          label.textContent = isCenter ? 'Case libre' : picked[phraseIndex++];
        }
        cell.appendChild(label);
        cell.addEventListener('click', () => toggleCell(cell));
        boardEl.appendChild(cell);
        boardMatrix[r][c] = cell;
        slotIndex++;
      }
    }

    playableCellCount = slotIndex;

    lastBingoText = 'Pas de bingo';
    updateStats();
  }

  function toggleCell(cell) {
    cell.classList.toggle('marked');
    const pressed = cell.classList.contains('marked');
    cell.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    checkBingo();
    updateStats();

    if (!pressed) return;

    if (cell.dataset.cellType === 'phenomenon') {
      const phenomenon = PHENOMENA_BY_ID.get(cell.dataset.phenomenonId) || cell.__phenomenon;
      if (phenomenon) {
        renderPhenomenonDetails(phenomenon);
        return;
      }
    }

    const phrase = cell.textContent.trim();
    showArgumentaire(phrase);
  }

  function showArgumentaire(phrase) {
    const arg = ARGUMENTAIRES[phrase] || "Pas encore d'argumentaire détaillé pour cette phrase.";
    const sources = ARG_SOURCES[phrase] || [];
    const sourcesHtml = sources.length
      ? `<h3>Sources</h3><ul>${sources.map(src => {
          const titre = src.titre || 'Source';
          const auteur = src.auteur ? ` (${src.auteur})` : '';
          const url = src.url ? `<a href="${src.url}" target="_blank" rel="noopener">${titre}</a>` : titre;
          return `<li>${url}${auteur}</li>`;
        }).join('')}</ul>`
      : '';
    setDetails(`<h2>${phrase}</h2><p>${arg}</p>${sourcesHtml}<p><strong>Contexte :</strong> ${contextInput.value || 'non précisé'}</p>`);
  }

  function gridCells() {
    return boardMatrix.flat().filter(Boolean);
  }

  function isMarked(r, c) {
    const cell = boardMatrix[r]?.[c] || null;
    return Boolean(cell && cell.classList.contains('marked'));
  }

  function clearMarks() {
    gridCells().forEach(el => {
      if (!el.classList.contains('free')) el.classList.remove('marked', 'bingo');
      el.classList.remove('bingo');
      el.setAttribute('aria-pressed', el.classList.contains('marked') ? 'true' : 'false');
    });
    lastBingoText = 'Pas de bingo';
    updateStats();
    renderDefaultDetails();
  }

  function checkBingo() {
    const allCells = gridCells();
    allCells.forEach(el => el.classList.remove('bingo'));

    const lines = [];
    for (let r = 0; r < size; r++) lines.push(Array.from({length:size}, (_, c) => [r, c]));
    for (let c = 0; c < size; c++) lines.push(Array.from({length:size}, (_, r) => [r, c]));
    lines.push(Array.from({length:size}, (_, i) => [i, i]));
    lines.push(Array.from({length:size}, (_, i) => [i, size - 1 - i]));

    let bingoCount = 0;
    for (const line of lines) {
      const cellsInLine = [];
      let full = true;
      for (const [r, c] of line) {
        const cell = boardMatrix[r]?.[c] || null;
        if (!cell || !cell.classList.contains('marked')) {
          full = false;
          break;
        }
        cellsInLine.push(cell);
      }
      if (full) {
        bingoCount++;
        cellsInLine.forEach(cell => cell.classList.add('bingo'));
      }
    }
    lastBingoText = bingoCount > 0 ? `Bingo: ${bingoCount} ligne${bingoCount>1?'s':''}` : 'Pas de bingo';
  }

  function updateStats() {
    const total = Math.max(1, playableCellCount);
    const marked = gridCells().filter(x => x.classList.contains('marked')).length;
    const pct = Math.round(marked * 100 / total);
    const parts = [`${marked}/${total} cochées`, `${pct}%`];
    if (lastBingoText) {
      parts.push(lastBingoText);
    }
    statsEl.textContent = parts.join(' • ');
  }

  function copyList() {
    const cells = gridCells().map(el => el.textContent.trim()).filter(t => t && t !== 'Case libre');
    const txt = cells.join('\n');
    navigator.clipboard.writeText(txt).then(() => {
      copyBtn.textContent = 'Liste copiée';
      setTimeout(() => copyBtn.textContent = 'Copier la liste tirée', 1200);
    });
  }
  newBtn.addEventListener('click', buildBoard);
  clearBtn.addEventListener('click', clearMarks);
  copyBtn.addEventListener('click', copyList);
  sizeSel.addEventListener('change', buildBoard);
  const handleDetailQueryChange = () => buildBoard();
  if (typeof detailEmbedQuery.addEventListener === 'function') {
    detailEmbedQuery.addEventListener('change', handleDetailQueryChange);
  } else if (typeof detailEmbedQuery.addListener === 'function') {
    detailEmbedQuery.addListener(handleDetailQueryChange);
  }

  async function loadArgumentaires() {
    try {
      const res = await fetch(apiUrl('/api/argumentaires'));
      if (!res.ok) throw new Error(`Statut ${res.status}`);
      const items = await res.json();
      if (Array.isArray(items) && items.length) {
        const cleanItems = items.filter(item => item && item.phrase);
        if (cleanItems.length) {
          const merged = new Map(
            FALLBACK_DATA.map(entry => [
              entry.phrase,
              { argumentaire: entry.argumentaire, sources: entry.sources || [] }
            ])
          );
          cleanItems.forEach(item => {
            merged.set(item.phrase, {
              argumentaire: item.argumentaire,
              sources: Array.isArray(item.sources) ? item.sources : []
            });
          });
          const sorted = Array.from(merged.entries()).sort((a, b) => a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' }));
          PHRASES = sorted.map(([phrase]) => phrase);
          ARGUMENTAIRES = Object.fromEntries(sorted.map(([phrase, data]) => [phrase, data.argumentaire]));
          ARG_SOURCES = Object.fromEntries(sorted.map(([phrase, data]) => [phrase, data.sources]));
          return;
        }
      }
    } catch (err) {
      console.warn("Chargement de la base sqlite impossible, usage du jeu intégré.", err);
    }
    const fallbackSorted = FALLBACK_DATA.slice().sort((a, b) => a.phrase.localeCompare(b.phrase, 'fr', { sensitivity: 'base' }));
    PHRASES = fallbackSorted.map(item => item.phrase);
    ARGUMENTAIRES = Object.fromEntries(fallbackSorted.map(item => [item.phrase, item.argumentaire]));
    ARG_SOURCES = Object.fromEntries(fallbackSorted.map(item => [item.phrase, item.sources || []]));
  }

  loadArgumentaires().finally(buildBoard);
})();
