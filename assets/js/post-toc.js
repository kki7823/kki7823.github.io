(function () {
  function slugify(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w가-힣-]/g, "");
  }

  function ensureID(heading, index) {
    if (heading.id) {
      return heading.id;
    }

    heading.id = slugify(heading.textContent) || "section-" + index;
    return heading.id;
  }

  function createTOC(headings) {
    var nav = document.createElement("nav");
    var title = document.createElement("p");
    var list = document.createElement("ol");

    nav.className = "post-toc";
    nav.setAttribute("aria-label", "본문 목차");

    title.className = "post-toc__title";
    title.textContent = "목차";

    list.className = "post-toc__list";

    headings.forEach(function (heading, index) {
      var id = ensureID(heading, index);
      var item = document.createElement("li");
      var link = document.createElement("a");

      item.className =
        "post-toc__item post-toc__item--" + heading.tagName.toLowerCase();
      link.className = "post-toc__link";
      link.href = "#" + id;
      link.textContent = heading.textContent;

      item.appendChild(link);
      list.appendChild(item);
    });

    nav.appendChild(title);
    nav.appendChild(list);
    return nav;
  }

  function observeCurrentSection(headings, items) {
    var activeIndex = -1;

    function setActive(index) {
      if (index === activeIndex || !items[index]) {
        return;
      }

      if (items[activeIndex]) {
        items[activeIndex].classList.remove("active");
      }

      activeIndex = index;
      items[activeIndex].classList.add("active");
    }

    function updateActiveSection() {
      var scrollTop = window.scrollY || window.pageYOffset;
      var viewportBottom = scrollTop + window.innerHeight;
      var pageBottom = document.documentElement.scrollHeight - 2;
      var currentIndex = 0;

      if (viewportBottom >= pageBottom) {
        setActive(items.length - 1);
        return;
      }

      headings.forEach(function (heading, index) {
        if (heading.offsetTop <= scrollTop + 160) {
          currentIndex = index;
        }
      });

      setActive(currentIndex);
    }

    items.forEach(function (item, index) {
      var link = item.querySelector(".post-toc__link");

      link.addEventListener("click", function (event) {
        event.preventDefault();
        headings[index].scrollIntoView({ block: "start" });
        history.pushState(null, "", link.hash);
        setActive(index);
      });
    });

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    updateActiveSection();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var content = document.querySelector(".body-post .post__content");
    var article = document.querySelector(".body-post article.post");

    if (!content || !article || document.querySelector(".post-toc")) {
      return;
    }

    var headings = Array.prototype.slice.call(
      content.querySelectorAll("h2, h3, h4")
    );

    if (headings.length < 2) {
      return;
    }

    var toc = createTOC(headings);
    article.insertBefore(toc, content);
    observeCurrentSection(
      headings,
      Array.prototype.slice.call(toc.querySelectorAll(".post-toc__item"))
    );
  });
})();
