const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

// Mostra cada seção conforme ela aparece na tela.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document
  .querySelectorAll(".section, .quote-section, .finale")
  .forEach((section) => {
    section.classList.add("reveal");
    revealObserver.observe(section);
  });

// As fotos selecionadas aparecem na galeria durante esta visita.
const gallery = document.querySelector("#gallery");

document.querySelector("#photo-input").addEventListener("change", (event) => {
  [...event.target.files].forEach((file) => {
    if (!file.type.startsWith("image/")) return;

    const imageUrl = URL.createObjectURL(file);
    const card = document.createElement("button");

    card.className = "memory-card uploaded-card";
    card.dataset.caption = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]/g, " ");
    card.setAttribute("aria-label", `Ampliar ${card.dataset.caption}`);

    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = card.dataset.caption;

    const caption = document.createElement("span");
    caption.className = "card-caption";
    caption.textContent = card.dataset.caption;

    card.append(image, caption);
    gallery.prepend(card);
  });

  event.target.value = "";
});

// Amplia fotos da galeria.
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");

function openLightbox(card) {
  const image = card.querySelector("img");
  if (!image) return;

  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = card.dataset.caption || image.alt;
  lightbox.classList.add("open");
}

gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".memory-card");
  if (card) openLightbox(card);
});

function closeLightbox() {
  lightbox.classList.remove("open");
  lightboxImage.src = "";
}

lightbox
  .querySelector(".lightbox-close")
  .addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

// As mensagens ficam salvas neste navegador.
const messageForm = document.querySelector("#message-form");
const messageWall = document.querySelector("#message-wall");
const storageKey = "uma-historia-mil-memorias-mensagens";

function readMessages() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function renderMessage(message) {
  const card = document.createElement("article");
  card.className = "message-card";

  const text = document.createElement("p");
  text.textContent = message.text;

  const author = document.createElement("strong");
  author.textContent = `— ${message.name}`;

  card.append(text, author);
  messageWall.prepend(card);
}

readMessages().forEach(renderMessage);

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nameField = document.querySelector("#student-name");
  const messageField = document.querySelector("#student-message");

  const message = {
    name: nameField.value.trim(),
    text: messageField.value.trim(),
  };

  if (!message.name || !message.text) return;

  const messages = readMessages();
  messages.unshift(message);

  try {
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(0, 100)));
  } catch {
    // A mensagem ainda aparece se o navegador não puder salvá-la.
  }

  renderMessage(message);
  messageForm.reset();
});