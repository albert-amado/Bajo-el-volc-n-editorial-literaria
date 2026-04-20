import noticiasRaw from "../data/noticias.json";

const COLOR_BY_CATEGORY = {
  evento: "bev-cat-evento",
  lanzamiento: "bev-cat-lanzamiento",
  convocatoria: "bev-cat-convocatoria",
  entrevista: "bev-cat-entrevista",
  premio: "bev-cat-premio",
  "proximas-publicaciones": "bev-cat-premio",
};

const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const normalizeCategory = (value = "") => slugify(value) || "general";

const parseFecha = (value = "") => {
  if (!value || typeof value !== "string") return null;

  const clean = value.trim();
  const dmyMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(clean);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatNewsDate = (value = "") => {
  const parsed = parseFecha(value);
  if (!parsed) return value || "Sin fecha";
  return parsed.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const noticiasPreparadas = [...noticiasRaw]
  .map((noticia, index) => {
    const categoriaKey = normalizeCategory(noticia.categoria);
    const categoriaLabel = noticia.categoria?.trim() || "General";
    const generatedSlug = slugify(noticia.slug || noticia.titulo || `noticia-${index + 1}`);
    const slug = generatedSlug || `noticia-${noticia.id || index + 1}`;
    const parsedDate = parseFecha(noticia.fecha);

    return {
      ...noticia,
      slug,
      categoriaKey,
      categoriaLabel,
      orderTime: parsedDate ? parsedDate.getTime() : 0,
    };
  })
  .sort((a, b) => b.orderTime - a.orderTime);

export const categoriasNoticias = Array.from(
  new Map(
    noticiasPreparadas.map((noticia) => [
      noticia.categoriaKey,
      {
        key: noticia.categoriaKey,
        label: noticia.categoriaLabel,
        colorClass: COLOR_BY_CATEGORY[noticia.categoriaKey] || "bev-cat-premio",
      },
    ]),
  ).values(),
);

export const getCategoriaColorClass = (categoriaKey) =>
  COLOR_BY_CATEGORY[categoriaKey] || "bev-cat-premio";

export const getNoticiaBySlug = (slug) =>
  noticiasPreparadas.find((noticia) => noticia.slug === slug);
