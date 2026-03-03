const menuGroups = document.querySelectorAll(".menu-grupo");

function resetMenu() {
  menuGroups.forEach((group) => {
    group.classList.remove("open");

    const parent = group.querySelector(".item");
    if (parent) parent.classList.remove("active");

    const subs = group.querySelectorAll(".sub-item");
    subs.forEach((s) => s.classList.remove("active"));
  });
}

menuGroups.forEach((group) => {
  const parentLink = group.querySelector(".item");
  const subItems = group.querySelectorAll(".sub-item");

  parentLink.addEventListener("click", (e) => {
    e.preventDefault();

    const wasOpen = group.classList.contains("open");

    resetMenu();

    if (!wasOpen) {
      group.classList.add("open");
      parentLink.classList.add("active");
    }
  });

  subItems.forEach((sub) => {
    sub.addEventListener("click", (e) => {
      resetMenu();

      group.classList.add("open");
      parentLink.classList.add("active");

      sub.classList.add("active");
    });
  });
});
