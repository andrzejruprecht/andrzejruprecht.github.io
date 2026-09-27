(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-site-nav]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menu.dataset.open !== "true";
      menu.dataset.open = String(open);
      menuButton.setAttribute("aria-expanded", String(open));
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        menu.dataset.open = "false";
        menuButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const publicationList = document.querySelector("[data-publication-list]");
  const publicationSearch = document.querySelector("[data-publication-search]");
  const publicationYear = document.querySelector("[data-publication-year]");
  const publicationCount = document.querySelector("[data-publication-count]");

  if (publicationList && Array.isArray(window.PUBLICATIONS)) {
    const publications = window.PUBLICATIONS;
    const years = [...new Set(publications.map((entry) => entry.year).filter(Boolean))].sort((a, b) => b - a);

    if (publicationYear) {
      for (const year of years) {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        publicationYear.append(option);
      }
    }

    const renderPublications = () => {
      const query = (publicationSearch?.value || "").trim().toLocaleLowerCase();
      const selectedYear = publicationYear?.value || "";
      const matches = publications.filter((entry) => {
        const matchesQuery = !query || entry.search.toLocaleLowerCase().includes(query);
        const matchesYear = !selectedYear || String(entry.year) === selectedYear;
        return matchesQuery && matchesYear;
      });

      publicationList.replaceChildren();
      for (const entry of matches) {
        const item = document.createElement("li");
        const year = document.createElement("span");
        const citation = document.createElement("span");
        year.className = "publication-year";
        year.textContent = entry.year || "—";
        citation.innerHTML = entry.citation;
        item.append(year, citation);
        publicationList.append(item);
      }

      if (publicationCount) {
        publicationCount.textContent = publicationCount.dataset.template
          ?.replace("{shown}", matches.length)
          .replace("{total}", publications.length) || `${matches.length} of ${publications.length}`;
      }
    };

    publicationSearch?.addEventListener("input", renderPublications);
    publicationYear?.addEventListener("change", renderPublications);
    renderPublications();
  }

  document.querySelectorAll("[data-language-tabs]").forEach((tabList) => {
    const tabs = [...tabList.querySelectorAll("[role='tab']")];
    const scope = tabList.closest("[data-language-scope]") || document;
    const panels = [...scope.querySelectorAll("[role='tabpanel']")];

    const activate = (tab, updateHash = true) => {
      for (const candidate of tabs) {
        const selected = candidate === tab;
        candidate.setAttribute("aria-selected", String(selected));
        candidate.tabIndex = selected ? 0 : -1;
      }
      for (const panel of panels) {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      }
      if (updateHash && tab.dataset.language) {
        history.replaceState(null, "", `#${tab.dataset.language}`);
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        tabs[next].focus();
        activate(tabs[next]);
      });
    });

    const hashLanguage = location.hash.slice(1).toLowerCase();
    const initial = tabs.find((tab) => tab.dataset.language === hashLanguage) || tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
    if (initial) activate(initial, false);
  });

  const filterButtons = [...document.querySelectorAll("[data-media-filter]")];
  const mediaCards = [...document.querySelectorAll("[data-media-category]")];
  if (filterButtons.length && mediaCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.mediaFilter;
        filterButtons.forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
        mediaCards.forEach((card) => {
          card.hidden = filter !== "all" && card.dataset.mediaCategory !== filter;
        });
      });
    });
  }
})();
