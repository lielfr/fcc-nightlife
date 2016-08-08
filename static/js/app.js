function onSearchEnd(data, textStatus, jqXHR) {
  $('#results').detach();
  $('.jumbotron').css({
    position: 'relative',
    top: 'auto',
    left: 'auto'
  });
  /*$('.jumbotron').animate({
    height: '50%'
  });*/
  var newParent = $('<div>', {
    id: 'results',
    class: 'round-corners results-parent'
  });
  data.forEach(function(item) {
    var newChildHeading = $('<h5>').html(item.name);
    var newChildAddress = $('<address>').html(item.address);
    var newChildImage = $('<img>', {
      class: 'img-fluid img-rounded m-x-auto',
      src: item.photo,
      alt: 'Place photo'
    });
    var headingCol = $('<div>').append(newChildHeading);
    var imageCol = $('<div>', {
      class: 'col-xs-5 col-md-4'
    }).append(newChildImage);
    var addressCol = $('<div>', {
      class: 'address-col'
    }).append(newChildAddress);
    var headingRow = $('<div>', {
      class: 'col-xs-7 col-md-6'
    }).append(headingCol).append(addressCol);
    var detailsRow = $('<div>', {
      class: 'row'
    }).append(imageCol).append(headingRow);
    var newChild = $('<div>', {
      class: 'round-corners results-child'
    }).append(detailsRow);
    newParent = newParent.append(newChild);
  });
  newParent.hide();
  $('body').append(newParent);
  newParent.show('slow');
}

$(document).ready(function() {
  $('#search-form').submit(function(event) {
    event.preventDefault();
    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: $(this).serialize(),
      dataType: 'json',
      success: onSearchEnd
    });
  });
});
