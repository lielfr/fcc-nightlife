var PlaceBox = React.createClass({
  render: function() {
    var imgClasses = "img-fluid img-rounded img-fsize m-x-auto";
    var imgAltText = "PlacePhoto";
    var imgSource = this.props.data.photo?this.props.data.photo:"/static/images/no-logo.svg";
    return (
      <div className="round-corners results-child">
        <div className="col-xs-5 col-md-4">
          <img className={imgClasses} alt={imgAltText} src={imgSource} />
        </div>
        <div className="col-xs-7 col-md-6">
          <h5>
            {this.props.data.name}
          </h5>
          <address>
            {this.props.data.address}
          </address>
        </div>
      </div>
    );
  }
});

var PlacesBox = React.createClass({
  render: function() {
    var placeBoxes = this.props.data.map(function(place) {
      return (
        <PlaceBox data={place} />
      );
    });
    return (
      <div className="round-corners results-parent">
        {placeBoxes}
      </div>
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

  ReactDOM.render(
    <PlacesBox data={data} />,
    document.querySelector('#results-container')
  );
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
