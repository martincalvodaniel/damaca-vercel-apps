export const currentWebsite = "https://labottegadipali.es"
export const contact = {
  email: "info@labottegadipali.es",
  phone: "+34 611 66 44 47",
  phoneHref: "tel:+34611664447",
  whatsapp: "https://wa.me/34611664447",
  instagram: "https://www.instagram.com/labottegadipali/",
}

export const navigation = [
  { href: "/talleres-de-ceramica/", label: "Talleres" },
  { href: "/clases-de-ceramica-regulares/", label: "Clases regulares" },
  { href: "/bono-regalo/", label: "Bono regalo" },
  { href: "/servicios/", label: "El taller" },
  { href: "/contacto/", label: "Contacto" },
] as const

export interface Experience {
  slug: string
  title: string
  category: "Cerámica" | "Cosmética natural"
  image: string
  description: string
  detail: string
  includes: string
}

export const experiences: readonly Experience[] = [
  {
    slug: "crea-y-decora-tu-taza-o-cuenco",
    title: "Tu taza, a tu manera",
    category: "Cerámica",
    image: "cups",
    description:
      "Modela una taza o un cuenco y dale tu toque con colores y texturas.",
    detail:
      "Un primer encuentro con el barro para crear una pieza que acompañe tus pequeños rituales. Te guiaremos desde el modelado hasta la decoración, sin necesidad de experiencia previa.",
    includes: "Materiales, herramientas, esmaltado y cocciones.",
  },
  {
    slug: "crea-y-decora-una-maceta-o-un-jarron",
    title: "Un hogar para tus plantas",
    category: "Cerámica",
    image: "vase",
    description:
      "Crea una maceta o un jarrón: formas orgánicas y piezas con personalidad.",
    detail:
      "Da forma a una maceta o un jarrón con tus manos. Explora el modelado y decora con engobes, relieves o esgrafiados para hacer una pieza tuya de principio a fin.",
    includes: "Materiales, herramientas, esmaltado y cocciones.",
  },
  {
    slug: "crea-y-decora-un-set-de-aperitivo",
    title: "Pequeños aperitivos, grandes momentos",
    category: "Cerámica",
    image: "aperitif",
    description:
      "Un plato y un cuenquito para compartir algo rico alrededor de la mesa.",
    detail:
      "Aprende distintas técnicas de modelado para crear las dos piezas de tu set de aperitivo. Después, experimenta con colores y detalles para vestir tu mesa de artesanía.",
    includes: "Materiales, herramientas, esmaltado y cocciones.",
  },
  {
    slug: "crea-y-decora-tres-pares-de-pendientes-y-un-joyero",
    title: "Cerámica para llevar contigo",
    category: "Cerámica",
    image: "jewelry",
    description:
      "Diseña tus propios pendientes y un joyero donde guardar pequeños tesoros.",
    detail:
      "Trabaja a pequeña escala y descubre las posibilidades del barro para crear accesorios. Juega con formas, colores y texturas en tus piezas y en su joyero.",
    includes: "Materiales, herramientas, fornituras, esmaltado y cocciones.",
  },
  {
    slug: "crea-y-decora-un-comedero-y-una-chapa-para-mascotas",
    title: "También para tu mejor compañía",
    category: "Cerámica",
    image: "pets",
    description:
      "Modela un comedero y una chapa personalizada para tu mascota.",
    detail:
      "Crea dos piezas únicas para tu mascota. Aprenderás a construirlas y decorarlas con colores, texturas y esos detalles que las hacen especiales.",
    includes: "Materiales, herramientas, esmaltado y cocciones.",
  },
  {
    slug: "crea-y-decora-adornos-navidenos",
    title: "Una Navidad hecha a mano",
    category: "Cerámica",
    image: "christmas",
    description:
      "Crea adornos de cerámica para decorar, regalar y conservar cada año.",
    detail:
      "Estrellas, copos y pequeñas formas de barro para dar un toque personal a las fiestas. Modela y pinta tus propios adornos con acompañamiento durante todo el proceso.",
    includes: "Materiales, herramientas, esmaltado y cocciones.",
  },
  {
    slug: "crema-facial-personalizada",
    title: "Un momento para cuidarte",
    category: "Cosmética natural",
    image: "cosmetics",
    description:
      "Descubre ingredientes y texturas para elaborar tu propia crema facial.",
    detail:
      "Acércate a la cosmética artesanal y conoce los ingredientes que intervienen en una crema facial. Una experiencia práctica para explorar formulaciones con orientación durante el taller.",
    includes: "Ingredientes, envases y dossier digital del taller.",
  },
]

export interface EditorialPage {
  slug: string
  eyebrow: string
  title: string
  description: string
  image: string
  sections: readonly { title: string; text: string }[]
  currentPath: string
  action: string
}

export const editorialPages: readonly EditorialPage[] = [
  {
    slug: "clases-de-ceramica-regulares",
    eyebrow: "Un ratito para ti, cada semana",
    title: "Aprender sin prisa. Crear a tu ritmo.",
    description:
      "Clases regulares de cerámica en Zaragoza para dar continuidad a tus ideas y disfrutar del proceso.",
    image: "studio",
    sections: [
      {
        title: "Tu cita con el barro",
        text: "Sesiones semanales de dos horas para explorar técnicas de modelado y decoración. No necesitas experiencia: te acompañamos mientras das forma a tus propias piezas.",
      },
      {
        title: "De la primera idea al esmalte",
        text: "Las clases se organizan por meses e incluyen materiales y cocciones. Consulta los grupos, el calendario y las condiciones vigentes antes de elegir tu plaza.",
      },
    ],
    currentPath: "/clases-de-ceramica-regulares/",
    action: "Consultar grupos en la web actual",
  },
  {
    slug: "bono-regalo",
    eyebrow: "Regala tiempo para crear",
    title: "Los mejores regalos también se viven.",
    description:
      "Un encuentro con el barro o la cosmética artesanal. Tú regalas la experiencia; esa persona elige su momento.",
    image: "pieces",
    sections: [
      {
        title: "Una experiencia muy suya",
        text: "El bono regalo permite escoger entre los talleres de La Bottega. También puedes preguntarnos por los bonos físicos disponibles en el local.",
      },
      {
        title: "Elige con toda la información",
        text: "Consulta los importes, la validez, la entrega y las condiciones de canje en la web actual antes de comprar tu bono.",
      },
    ],
    currentPath: "/producto/bono-regalo/",
    action: "Ver bonos en la web actual",
  },
  {
    slug: "celebraciones",
    eyebrow: "La creatividad se comparte",
    title: "Una ocasión especial. Un recuerdo hecho a mano.",
    description:
      "Cumpleaños, encuentros entre amigos o actividades de empresa: un taller privado para disfrutar juntos.",
    image: "gathering",
    sections: [
      {
        title: "Un taller a vuestro gusto",
        text: "Cerámica o cosmética artesanal, en buena compañía y con una propuesta adaptada al grupo. No hace falta saber modelar: lo importante es disfrutar del encuentro.",
      },
      {
        title: "Cuéntanos vuestra idea",
        text: "Las celebraciones se organizan consultando previamente fechas, número de personas y temática. Escríbenos para conocer disponibilidad y preparar una propuesta.",
      },
    ],
    currentPath: "/celebraciones/",
    action: "Ver celebraciones en la web actual",
  },
  {
    slug: "servicios",
    eyebrow: "Más allá de los talleres",
    title: "Un espacio para dar vida a tus ideas.",
    description:
      "Piezas por encargo, nuevas historias para objetos queridos y un horno al servicio de tus creaciones.",
    image: "pieces",
    sections: [
      {
        title: "Cerámica personalizada",
        text: "Estudiamos contigo materiales, formas y acabados para crear una pieza especial, una vajilla o detalles para una celebración.",
      },
      {
        title: "Cuidar lo que ya existe",
        text: "La restauración de piezas y el servicio de cocción acompañan a quienes quieren alargar la vida de un objeto o llevar su trabajo cerámico un paso más allá.",
      },
    ],
    currentPath: "/servicios/",
    action: "Consultar servicios en la web actual",
  },
  {
    slug: "alquiler-de-horno-ceramico",
    eyebrow: "El último paso de tu creación",
    title: "Tus piezas, listas para cobrar vida.",
    description:
      "Servicio de cocción de alta y baja temperatura y esmaltado transparente en Zaragoza.",
    image: "studio",
    sections: [
      {
        title: "Cada barro tiene su temperatura",
        text: "Trabajamos con cargas y piezas sueltas según sus características. Necesitamos conocer las especificaciones de tus pastas y esmaltes para estudiar la cocción adecuada.",
      },
      {
        title: "En manos del taller",
        text: "La carga, programación y descarga del horno las realizamos en La Bottega. Consulta las tarifas vigentes y cuéntanos qué piezas quieres cocer.",
      },
    ],
    currentPath: "/alquiler-de-horno-ceramico/",
    action: "Ver el servicio en la web actual",
  },
  {
    slug: "restauracion-de-piezas-de-ceramica",
    eyebrow: "Belleza que continúa",
    title: "Cada pieza merece otra historia.",
    description:
      "Restauración de cerámica inspirada en el kintsugi, para poner en valor las huellas de tus objetos.",
    image: "restoration",
    sections: [
      {
        title: "Las cicatrices también cuentan",
        text: "Una rotura puede formar parte de la historia de un objeto. Estudiamos cada pieza y sus posibilidades de restauración de forma individual.",
      },
      {
        title: "Empezamos por conocer tu pieza",
        text: "Ponte en contacto con el taller para valorar el estado, el acabado y el uso que quieres darle. El presupuesto se prepara para cada caso.",
      },
    ],
    currentPath: "/restauracion-de-piezas-de-ceramica/",
    action: "Ver restauración en la web actual",
  },
  {
    slug: "encargos-personalizados",
    eyebrow: "De tu idea a nuestras manos",
    title: "Cerámica con algo de ti.",
    description:
      "Piezas únicas, detalles personalizados y vajillas que nacen de una conversación.",
    image: "cups",
    sections: [
      {
        title: "Diseñamos contigo",
        text: "Cuéntanos qué necesitas, qué colores te inspiran y cómo vas a usar tu pieza. Estudiaremos juntos las posibilidades de un proceso artesanal.",
      },
      {
        title: "El tiempo de lo hecho a mano",
        text: "Modelado, secado, esmaltado y cocción tienen su propio ritmo. Los precios y plazos se confirman para cada encargo antes de empezar.",
      },
    ],
    currentPath: "/encargos-personalizados/",
    action: "Ver encargos en la web actual",
  },
]
