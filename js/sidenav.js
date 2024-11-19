/**
 * SIDE NAVIGATION
 **/

const sideNav = function () {
  const $sidenav_content = $("#sidenav_content");

  $sidenav_content.on('click', ".nav-dropdown-link", function () {
    const $dropdown = $(this).closest(".nav-dropdown");

    if ($dropdown.hasClass('open')) {
      $dropdown.removeClass('open');
    } else {
      $dropdown.addClass('open');
      $dropdown.siblings('.nav-dropdown').removeClass('open');
    }
  });

  // handle toggle
  const $toggle = $(".sidenav-toggler");

  if ($toggle) {
    const $sidenav = $(".sidenav");
    const $mainBody = $(".main-body");

    const addHoverable = () => {
      $sidenav.toggleClass("show");
    }
    $toggle.on('click', function () {
      $sidenav.toggleClass("collapsed");
      $mainBody.toggleClass("sidenav-collapsed");

      setTimeout(addHoverable, 150);
    })
  }
}