// Kelvin Mark 1: small enhancements. The site works fully without this file.

// Today's weekday in Glasgow time, so a visitor abroad still sees Glasgow's "tonight".
function todayInGlasgow() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: "Europe/London",
  }).format(new Date());
}

function initFilters() {
  const bar = document.getElementById("filters");
  const list = document.getElementById("quiz-list");
  const status = document.getElementById("status");
  if (!bar || !list || !status) return; // not on a list page

  const items = Array.from(list.querySelectorAll("li[data-day]"));
  const buttons = Array.from(bar.querySelectorAll("button[data-filter]"));
  const today = todayInGlasgow();

  function apply(filter) {
    let shown = 0;
    for (const li of items) {
      const match =
        filter === "tonight" ? li.dataset.day === today :
        filter === "free" ? li.dataset.free === "true" :
        true;
      li.hidden = !match;
      if (match) shown++;
    }
    for (const btn of buttons) {
      btn.setAttribute("aria-pressed", String(btn.dataset.filter === filter));
    }
    // textContent only, never innerHTML: nothing here can turn into code.
    if (filter === "tonight") {
      status.textContent = shown === 0
        ? `No quizzes tonight (${today}). Try All to see the week.`
        : `${shown} on tonight (${today}).`;
    } else if (filter === "free") {
      status.textContent = shown === 0 ? "No free quizzes listed yet." : `${shown} free to enter.`;
    } else {
      status.textContent = `${shown} quizzes listed.`;
    }
  }

  for (const btn of buttons) {
    btn.addEventListener("click", () => apply(btn.dataset.filter));
  }
  bar.hidden = false; // only show the buttons once they actually work
}

function initShare() {
  for (const btn of document.querySelectorAll("[data-share]")) {
    const label = btn.textContent;
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      // Share the clean page address only: no ?query or #hash that could carry tracking.
      const url = location.origin + location.pathname;
      try {
        if (navigator.share) {
          await navigator.share({ title: document.title, url });
          return;
        }
        await navigator.clipboard.writeText(url);
        btn.textContent = "Link copied";
      } catch (err) {
        if (err.name === "AbortError") return; // the person closed the share sheet
        btn.textContent = "Couldn't share";
      }
      setTimeout(() => { btn.textContent = label; }, 2000);
    });
  }
}

initFilters();
initShare();