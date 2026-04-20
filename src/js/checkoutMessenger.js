const DEFAULT_WHATSAPP_NUMBER = "573144559506";
const DEFAULT_EMAIL = "bajoelvolcane@gmail.com";

export class CheckoutMessenger {
  constructor(options = {}) {
    this.whatsAppNumber = options.whatsAppNumber || DEFAULT_WHATSAPP_NUMBER;
    this.email = options.email || DEFAULT_EMAIL;
  }

  getTotals(items = []) {
    return items.reduce(
      (acc, item) => {
        const cantidad = Number(item.cantidad || 0);
        const precio = Number(item.precio || 0);

        acc.totalLibros += cantidad;
        acc.totalValor += cantidad * precio;
        return acc;
      },
      { totalLibros: 0, totalValor: 0 },
    );
  }

  buildMessage(items = []) {
    const { totalLibros, totalValor } = this.getTotals(items);

    const lines = [
      "Hola, Bajo el Volcan Ediciones.",
      "Estoy interesado en los siguientes libros de su catalogo. Puedes guiarme para hacer el proceso de envio?",
      "",
      "Detalle del pedido:",
    ];

    items.forEach((item, index) => {
      const cantidad = Number(item.cantidad || 0);
      const precio = Number(item.precio || 0);
      const subtotal = cantidad * precio;

      lines.push(
        `${index + 1}. ${item.titulo} | Cantidad: ${cantidad} | Precio: $${precio.toLocaleString("es-CO")} | Subtotal: $${subtotal.toLocaleString("es-CO")}`,
      );
    });

    lines.push("");
    lines.push(`Total de libros: ${totalLibros}`);
    lines.push(`Valor total: $${totalValor.toLocaleString("es-CO")}`);

    return lines.join("\n");
  }

  getWhatsAppUrl(items = []) {
    const message = encodeURIComponent(this.buildMessage(items));
    return `https://wa.me/${this.whatsAppNumber}?text=${message}`;
  }

  getMailtoUrl(items = []) {
    const subject = encodeURIComponent("Compra de libros - Bajo el Volcan");
    const body = encodeURIComponent(this.buildMessage(items));
    return `mailto:${this.email}?subject=${subject}&body=${body}`;
  }

  openWhatsApp(items = []) {
    if (!items.length) return;
    window.open(this.getWhatsAppUrl(items), "_blank", "noopener,noreferrer");
  }

  openEmail(items = []) {
    if (!items.length) return;
    window.location.href = this.getMailtoUrl(items);
  }
}
