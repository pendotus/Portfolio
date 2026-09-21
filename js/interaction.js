// ФИКС БАГА 2: Снятие черного экрана при переходе по стрелке "Назад" (BFCache)
window.addEventListener("pageshow", () => {
  document.body.classList.remove("page-fade-out");
});

// Логика главной страницы: синхронизация артборда, мобильного переключателя превью и тем
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("page-fade-out");
  const rowsContainer = document.getElementById("projectRowsContainer");
  const stageNum = document.getElementById("stageNum");
  const stageName = document.getElementById("stageName");
  const stageImage = document.getElementById("stageImage");
  const stageDesc = document.getElementById("stageDesc");
  const btnOpenCase = document.getElementById("btnOpenCase");
  const stageNavCounter = document.getElementById("stageNavCounter");
  const prevStageBtn = document.getElementById("prevStageBtn");
  const nextStageBtn = document.getElementById("nextStageBtn");

  const landscape = new AsciiLandscapeEngine("asciiBackground");
  landscape.start();
  new PortfolioThemeManager(landscape);

  let currentCaseIndex = 0;
  const totalCases = designerCases.length;
  
  // Централизованная функция обновления активного кейса
  function setActiveCase(index) {
    if (index < 0 || index >= totalCases) return;
    currentCaseIndex = index;
    const item = designerCases[index];

    // 1. Обновление текстовых и визуальных данных сцены
    stageNum.textContent = `${item.code} // ${item.year}`;
    stageName.textContent = item.title;
    stageImage.style.backgroundImage = `url('${item.image}')`;
    stageDesc.textContent = item.summary;
    btnOpenCase.href = `project.html?id=${item.id}`;

    // 2. Обновление мобильного счетчика (01 / 06)
    if (stageNavCounter) {
      stageNavCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(totalCases).padStart(2, "0")}`;
    }

    // 3. Синхронизация подсветки активной строки в реестре внизу
    document.querySelectorAll(".project-row").forEach((r, idx) => {
      r.classList.toggle("active", idx === index);
    });
  }

  function navigateSmoothly(url) {
    document.body.classList.add("page-fade-out");
    setTimeout(() => {
      window.location.href = url;
    }, 320);
  }

  // Генерация строк реестра проектов
  designerCases.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = `project-row ${index === 0 ? "active" : ""}`;
    row.dataset.id = item.id;

    row.innerHTML = `
      <span class="row-date">${item.year}</span>
      <div class="row-main">
        <span class="row-title">${item.title}</span>
        <span class="row-category">${item.category}</span>
      </div>
      <span class="row-action-icon">→</span>
    `;

    // Наведение мыши (десктоп) переключает превью
    row.addEventListener("mouseenter", () => {
      setActiveCase(index);
    });

    // Клик по строке открывает страницу кейса
    row.addEventListener("click", () => {
      navigateSmoothly(`project.html?id=${item.id}`);
    });

    rowsContainer.appendChild(row);
  });

  // Мобильные кнопки переключения превью (кольцевой цикл)
  if (prevStageBtn) {
    prevStageBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const prevIndex = (currentCaseIndex - 1 + totalCases) % totalCases;
      setActiveCase(prevIndex);
    });
  }

  if (nextStageBtn) {
    nextStageBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const nextIndex = (currentCaseIndex + 1) % totalCases;
      setActiveCase(nextIndex);
    });
  }

  // Инициализация первого кейса
  if (totalCases > 0) {
    setActiveCase(0);
  }

  btnOpenCase.addEventListener("click", (e) => {
    e.preventDefault();
    navigateSmoothly(btnOpenCase.href);
  });
});