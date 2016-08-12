var PlaceBox = React.createClass({
  displayName: "PlaceBox",

  render: function () {
    var imgClasses = "img-fluid img-rounded img-fsize m-x-auto";
    var imgAltText = "PlacePhoto";
    var imgSource = this.props.data.photo ? this.props.data.photo : "/static/images/no-logo.svg";
    return React.createElement(
      "div",
      { className: "round-corners results-child" },
      React.createElement(
        "div",
        { className: "col-xs-5 col-md-4" },
        React.createElement("img", { className: imgClasses, alt: imgAltText, src: imgSource })
      ),
      React.createElement(
        "div",
        { className: "col-xs-7 col-md-6" },
        React.createElement(
          "h5",
          null,
          this.props.data.name
        ),
        React.createElement(
          "address",
          null,
          this.props.data.address
        )
      )
    );
  }
});

var PlacesBox = React.createClass({
  displayName: "PlacesBox",

  render: function () {
    var placeBoxes = this.props.data.map(function (place) {
      return React.createElement(PlaceBox, { data: place });
    });
    return React.createElement(
      "div",
      { className: "round-corners results-parent" },
      placeBoxes
    );
  }
});

function onSearchEnd(data, textStatus, jqXHR) {
  $('#results-container').html('');
  $('.jumbotron').css({
    position: 'relative',
    top: 'auto',
    left: 'auto'
  });

  ReactDOM.render(React.createElement(PlacesBox, { data: data }), document.querySelector('#results-container'));
}

$(document).ready(function () {
  $('#search-form').submit(function (event) {
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