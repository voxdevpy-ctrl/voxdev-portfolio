(function startVoxdevSite() {
  "use strict";

  const config = window.VOXDEV_CONFIG;
  const validation = window.VoxdevValidation;
  const state = {
    activeProject: 0,
    comments: [],
    contacts: structuredClone(config.contacts),
    adminPassword: sessionStorage.getItem("voxdev_admin_password") || "",
    touchStartX: 0,
    wheelLocked: false
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const iconPaths = {
    window: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 8h18M7 6h.01M10 6h.01"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 5 5M8 11h6M11 8v6"/>',
    support: '<path d="M4 14a8 8 0 0 1 16 0"/><path d="M4 14v3a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2ZM20 14v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2ZM16 19c0 1.1-.9 2-2 2h-2"/>',
    cursor: '<path d="m5 3 14 8-6 2-3 6-5-16Z"/>',
    store: '<path d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path d="M8 20v-6h5v6M3 10c0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0 0 2 3 2 3 0"/>',
    menu: '<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="3" cy="6" r=".5"/><circle cx="3" cy="12" r=".5"/><circle cx="3" cy="18" r=".5"/>',
    plus: '<path d="M12 4v16M4 12h16"/>'
  };

  function createIcon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter">${iconPaths[name]}</svg>`;
  }

  function renderMarketingCopy() {
    $$("[data-copy]").forEach((element) => {
      element.textContent = config.copy[element.dataset.copy];
    });
    const benefits = $("[data-benefits]");
    benefits.replaceChildren();
    config.copy.benefits.forEach((benefit) => {
      const item = document.createElement("li");
      item.textContent = benefit;
      benefits.append(item);
    });
    const panelLines = $("[data-panel-lines]");
    panelLines.replaceChildren();
    config.copy.panelLines.forEach((line) => {
      const paragraph = document.createElement("p");
      const marker = document.createElement("span");
      paragraph.className = "panel-code";
      marker.textContent = ">";
      paragraph.append(marker, ` ${line}`);
      panelLines.append(paragraph);
    });
    $("[data-panel-status]").textContent = config.copy.panelStatus;
  }

  function renderServices() {
    $("[data-services]").innerHTML = config.services
      .map((service) => `
        <article class="service-card reveal${service.isCta ? " is-cta" : ""}">
          ${createIcon(service.icon)}
          <div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
          </div>
        </article>
      `)
      .join("");
  }

  function renderProof() {
    $("[data-proof]").innerHTML = config.proof
      .map((item) => `
        <article class="proof-item reveal">
          <span>${item.label}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `)
      .join("");
  }

  function renderProcess() {
    $("[data-process]").innerHTML = config.process
      .map((item) => `
        <li class="process-card reveal">
          <span>${item.step}</span>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </li>
      `)
      .join("");
  }

  function renderFaq() {
    $("[data-faq]").innerHTML = config.faq
      .map((item) => `
        <details class="faq-item reveal">
          <summary>${item.question}</summary>
          <p>${item.answer}</p>
        </details>
      `)
      .join("");
  }

  function whatsappUrl() {
    const number = state.contacts.whatsapp.number.replace(/\D/g, "");
    return number ? `https://wa.me/${number}?text=${encodeURIComponent(state.contacts.whatsapp.message)}` : "";
  }

  function emailUrl() {
    const address = state.contacts.email.address.trim();
    return address ? `mailto:${address}?subject=${encodeURIComponent(state.contacts.email.subject)}` : "";
  }

  function contactData() {
    return [
      {
        icon: "IG",
        label: state.contacts.instagram.label,
        value: state.contacts.instagram.value,
        url: state.contacts.instagram.url
      },
      {
        icon: "WA",
        label: state.contacts.whatsapp.label,
        value: state.contacts.whatsapp.value,
        url: whatsappUrl()
      },
      {
        icon: "@",
        label: state.contacts.email.label,
        value: state.contacts.email.value,
        url: emailUrl()
      }
    ];
  }

  function renderContacts() {
    const contacts = contactData();
    const container = $("[data-contacts]");
    container.replaceChildren();
    contacts.forEach((contact) => {
      const card = document.createElement(contact.url ? "a" : "span");
      const icon = document.createElement("span");
      const content = document.createElement("span");
      const label = document.createElement("b");
      const value = document.createElement("small");
      card.className = `contact-button${contact.url ? "" : " is-disabled"}`;
      icon.className = "contact-icon";
      icon.textContent = contact.icon;
      label.textContent = contact.label;
      value.textContent = contact.value || "Canal em configuração";
      content.append(label, value);
      card.append(icon, content);
      if (contact.url) {
        card.href = contact.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
      } else {
        card.setAttribute("aria-disabled", "true");
      }
      container.append(card);
    });

    const hasEmptyContact = contacts.some((contact) => !contact.url);
    $("[data-contact-note]").textContent = hasEmptyContact
      ? "Alguns canais ainda aguardam configuração antes da publicação."
      : "Escolha o canal que for mais confortável para você.";

    const floatingWhatsapp = $("[data-floating-whatsapp]");
    const url = whatsappUrl();
    if (url) {
      floatingWhatsapp.href = url;
      floatingWhatsapp.hidden = false;
    }

    const footerLinks = $("[data-footer-links]");
    footerLinks.replaceChildren();
    contacts.filter((contact) => contact.url).forEach((contact) => {
      const link = document.createElement("a");
      link.href = contact.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = contact.label;
      footerLinks.append(link);
    });
    $("[data-footer-tagline]").textContent = config.footer.tagline;
    renderAdminContactEditor();
  }

  function renderAdminContactEditor() {
    const form = $("[data-admin-contact-form]");
    form.hidden = !state.adminPassword;
    if (!state.adminPassword) return;
    form.elements.instagramValue.value = state.contacts.instagram.value;
    form.elements.instagramUrl.value = state.contacts.instagram.url;
    form.elements.whatsappValue.value = state.contacts.whatsapp.value;
    form.elements.whatsappNumber.value = state.contacts.whatsapp.number;
    form.elements.emailValue.value = state.contacts.email.value;
    form.elements.emailAddress.value = state.contacts.email.address;
  }

  async function loadContacts() {
    try {
      const response = await fetch("/api/contacts", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const payload = await response.json();
      state.contacts = payload.contacts;
      renderContacts();
    } catch {
      renderContacts();
    }
  }

  async function saveContacts(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = $("[data-admin-contact-status]");
    const payload = {
      instagram: {
        value: form.elements.instagramValue.value,
        url: form.elements.instagramUrl.value
      },
      whatsapp: {
        value: form.elements.whatsappValue.value,
        number: form.elements.whatsappNumber.value
      },
      email: {
        value: form.elements.emailValue.value,
        address: form.elements.emailAddress.value
      }
    };
    status.textContent = "Salvando contatos...";
    try {
      const response = await fetch("/api/admin/contacts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": state.adminPassword
        },
        body: JSON.stringify(payload)
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Não foi possível salvar os contatos.");
      state.contacts = body.contacts;
      renderContacts();
      status.textContent = "Contatos atualizados com sucesso.";
      status.className = "form-status is-success";
    } catch (error) {
      status.textContent = error.message;
      status.className = "form-status is-error";
    }
  }

  function renderProject() {
    const projects = config.projects;
    const screen = $("[data-project-screen]");
    const controls = $$("[data-project-previous], [data-project-next]");
    if (!projects.length) {
      controls.forEach((control) => { control.disabled = true; });
      return;
    }

    const project = projects[state.activeProject];
    screen.innerHTML = `
      <div class="screen-project">
        <img src="${project.image}" alt="${project.imageAlt}" loading="lazy">
        <div><strong>${project.name}</strong><span>${project.description}</span></div>
      </div>
    `;
    $("[data-project-counter]").textContent = `${String(state.activeProject + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
    $("[data-project-title]").textContent = project.name;
    $("[data-project-description]").textContent = project.description;
    controls.forEach((control) => { control.disabled = projects.length < 2; });
  }

  function moveProject(direction) {
    if (config.projects.length < 2) return;
    state.activeProject = (state.activeProject + direction + config.projects.length) % config.projects.length;
    renderProject();
  }

  function bindProjectControls() {
    const stage = $("[data-project-stage]");
    $("[data-project-previous]").addEventListener("click", () => moveProject(-1));
    $("[data-project-next]").addEventListener("click", () => moveProject(1));
    stage.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") moveProject(-1);
      if (event.key === "ArrowRight") moveProject(1);
    });
    stage.addEventListener("wheel", (event) => {
      if (config.projects.length < 2 || state.wheelLocked || Math.abs(event.deltaY) < 12) return;
      event.preventDefault();
      state.wheelLocked = true;
      moveProject(event.deltaY > 0 ? 1 : -1);
      setTimeout(() => { state.wheelLocked = false; }, 520);
    }, { passive: false });
    stage.addEventListener("touchstart", (event) => {
      state.touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    stage.addEventListener("touchend", (event) => {
      const delta = event.changedTouches[0].clientX - state.touchStartX;
      if (Math.abs(delta) >= 42) moveProject(delta > 0 ? -1 : 1);
    }, { passive: true });
  }

  function setFormStatus(message, type = "") {
    const status = $("[data-form-status]");
    status.textContent = message;
    status.className = `form-status${type ? ` is-${type}` : ""}`;
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(value));
  }

  function createCommentElement(comment) {
    const article = document.createElement("article");
    article.className = "comment";
    const header = document.createElement("div");
    header.className = "comment-header";
    const name = document.createElement("strong");
    const date = document.createElement("time");
    const message = document.createElement("p");
    name.textContent = comment.name;
    date.dateTime = comment.createdAt;
    date.textContent = formatDate(comment.createdAt);
    message.textContent = comment.message;
    header.append(name, date);
    article.append(header, message);
    if (state.adminPassword) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "delete-comment";
      button.textContent = "Excluir comentário";
      button.addEventListener("click", () => deleteComment(comment.id));
      article.append(button);
    }
    return article;
  }

  function renderComments() {
    const container = $("[data-comments-list]");
    container.replaceChildren();
    if (!state.comments.length) {
      const empty = document.createElement("p");
      empty.className = "empty-comments";
      empty.textContent = "Ainda não há mensagens publicadas.";
      container.append(empty);
      return;
    }
    state.comments.forEach((comment) => container.append(createCommentElement(comment)));
  }

  async function loadComments() {
    try {
      const response = await fetch("/api/comments", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Não foi possível carregar as mensagens.");
      const payload = await response.json();
      state.comments = payload.comments;
      renderComments();
    } catch {
      $("[data-comments-list]").innerHTML = '<p class="empty-comments">As mensagens estão temporariamente indisponíveis.</p>';
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = $("[data-comment-submit]");
    const payload = {
      name: form.elements.name.value,
      message: form.elements.message.value
    };
    const result = validation.validateComment(payload);
    if (!result.ok) {
      setFormStatus(result.message, "error");
      return;
    }
    const lastSubmit = Number(localStorage.getItem("voxdev_last_comment_at") || 0);
    if (Date.now() - lastSubmit < 60000) {
      setFormStatus("Aguarde um minuto antes de publicar outra mensagem.", "error");
      return;
    }
    submit.disabled = true;
    submit.textContent = "Publicando...";
    setFormStatus("Enviando sua mensagem...");
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.value)
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Não foi possível publicar sua mensagem.");
      localStorage.setItem("voxdev_last_comment_at", String(Date.now()));
      form.reset();
      $("[data-character-count]").textContent = "0";
      setFormStatus("Mensagem publicada com sucesso.", "success");
      await loadComments();
    } catch (error) {
      setFormStatus(error.message, "error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Publicar mensagem";
    }
  }

  async function deleteComment(id) {
    if (!window.confirm("Excluir esta mensagem permanentemente?")) return;
    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "X-Admin-Password": state.adminPassword }
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Não foi possível excluir a mensagem.");
      await loadComments();
    } catch (error) {
      window.alert(error.message);
      if (/senha/i.test(error.message)) {
        sessionStorage.removeItem("voxdev_admin_password");
        state.adminPassword = "";
        renderComments();
      }
    }
  }

  function bindComments() {
    $("[data-comment-form]").addEventListener("submit", submitComment);
    $("#comment-message").addEventListener("input", (event) => {
      $("[data-character-count]").textContent = String(event.currentTarget.value.length);
    });
    $("[data-admin-toggle]").addEventListener("click", () => {
      if (state.adminPassword) {
        sessionStorage.removeItem("voxdev_admin_password");
        state.adminPassword = "";
        renderComments();
        renderContacts();
        window.alert("Modo de administração encerrado.");
        return;
      }
      const password = window.prompt("Informe a senha de administração:");
      if (!password) return;
      sessionStorage.setItem("voxdev_admin_password", password);
      state.adminPassword = password;
      renderComments();
      renderContacts();
      window.alert("Modo de administração ativado. As opções de exclusão estão visíveis.");
    });
    $("[data-admin-contact-form]").addEventListener("submit", saveContacts);
  }

  function bindReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((element) => observer.observe(element));
  }

  function bindHeader() {
    const header = $("[data-header]");
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  renderMarketingCopy();
  renderServices();
  renderProof();
  renderProcess();
  renderFaq();
  renderContacts();
  renderProject();
  bindProjectControls();
  bindComments();
  bindReveal();
  bindHeader();
  loadComments();
  loadContacts();
})();
