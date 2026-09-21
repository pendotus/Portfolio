// Логика длинной страницы кейса (project.html)
document.addEventListener("DOMContentLoaded", () => {
  const landscape = new AsciiLandscapeEngine("asciiBackground");
  landscape.start();
  new PortfolioThemeManager(landscape);

  const params = new URLSearchParams(window.location.search);
  let currentId = parseInt(params.get("id"), 10) || 1;
  const currentIndex = designerCases.findIndex(p => p.id === currentId);
  const activeProject = currentIndex !== -1 ? designerCases[currentIndex] : designerCases[0];
  const actualIndex = currentIndex !== -1 ? currentIndex : 0;

  function navigateSmoothly(url) {
    document.body.classList.add("page-fade-out");
    setTimeout(() => {
      window.location.href = url;
    }, 320);
  }

  // Заполнение метаданных и заголовков кейса
  document.title = `${activeProject.title} // Mark Yatsiv Portfolio`;
  const codeBadge = document.getElementById("projectCodeBadge");
  const yearBadge = document.getElementById("projectYearBadge");
  const catEl = document.getElementById("projectCategory");
  const titleEl = document.getElementById("projectTitle");
  const summaryEl = document.getElementById("projectSummary");
  const heroImgEl = document.getElementById("projectHeroImage");
  const descEl = document.getElementById("projectFullDescription");

  if (codeBadge) codeBadge.textContent = activeProject.code;
  if (yearBadge) yearBadge.textContent = activeProject.year;
  if (catEl) catEl.textContent = `${activeProject.category} · ${activeProject.year}`;
  if (titleEl) titleEl.textContent = activeProject.title;
  if (summaryEl) summaryEl.textContent = activeProject.summary;
  if (heroImgEl) heroImgEl.style.backgroundImage = `url('${activeProject.image}')`;
  if (descEl) descEl.textContent = activeProject.description;

  // Настройка пагинации между кейсами (и сверху, и снизу страницы)
  const total = designerCases.length;
  const prevIndex = (actualIndex - 1 + total) % total;
  const nextIndex = (actualIndex + 1) % total;
  const prevUrl = `project.html?id=${designerCases[prevIndex].id}`;
  const nextUrl = `project.html?id=${designerCases[nextIndex].id}`;
  const counterText = `${String(actualIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  // Верхняя пагинация
  const prevLinkTop = document.getElementById("prevProjectLink");
  const nextLinkTop = document.getElementById("nextProjectLink");
  const counterTop = document.getElementById("paginationIndicator");
  if (prevLinkTop) prevLinkTop.href = prevUrl;
  if (nextLinkTop) nextLinkTop.href = nextUrl;
  if (counterTop) counterTop.textContent = counterText;

  // Нижняя пагинация (продублированная в конце презентации)
  const prevLinkBottom = document.getElementById("prevProjectLinkBottom");
  const nextLinkBottom = document.getElementById("nextProjectLinkBottom");
  const counterBottom = document.getElementById("paginationIndicatorBottom");
  if (prevLinkBottom) prevLinkBottom.href = prevUrl;
  if (nextLinkBottom) nextLinkBottom.href = nextUrl;
  if (counterBottom) counterBottom.textContent = counterText;

  // Плавные переходы для ссылок
  document.querySelectorAll(".page-transition-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateSmoothly(link.href);
    });
  });
  
  // Генерация длинной вертикальной презентации кейса (поддержка изображений и видео)
  const slidesContainer = document.getElementById("showcaseSlidesStack");
  if (slidesContainer) {
    slidesContainer.innerHTML = "";
    const slides = activeProject.presentationSlides || [activeProject.image];
    slides.forEach((slideData, idx) => {
      const slideItem = document.createElement("div");
      slideItem.className = "showcase-slide-item";

      // Проверяем: это видео-объект или стандартная картинка-слайд
      if (typeof slideData === "object" && slideData.type === "video") {
        slideItem.classList.add("showcase-video-item");
        slideItem.innerHTML = `
          <div class="video-responsive-wrapper">
            <iframe 
              src="${slideData.url}" 
              title="${activeProject.title} — видео кейса"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" 
              frameborder="0" 
              allowfullscreen 
              loading="lazy">
            </iframe>
          </div>
        `;
      } else {
        slideItem.innerHTML = `<img src="${slideData}" alt="${activeProject.title} — слайд ${idx + 1}" loading="lazy">`;
      }

      slidesContainer.appendChild(slideItem);
    });
  }

  // Кнопка "Наверх" с пиксельной ASCII-стрелкой (только для страниц кейсов)
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 320) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
});
