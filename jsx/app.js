var GoingBox = React.createClass({
  getInitialState: function() {
    return {
      activeControls: false,
      obj: {
        going: '-',
        isGoing: false
      }
    };
  },
  componentDidMount: function() {
    var requestURL = '/places/check?placeID=' + this.props.placeID;
    this.request = $.getJSON(requestURL, function(data) {
      if (data && data.status === 'success') {
        this.setState({
          activeControls: true,
          obj: data.msg
        });
      }
    }.bind(this));
  },
  componentDidUnmount: function() {
    this.request.abort;
  },
  onGoing: function() {
    // TODO: Implement an ajax call here.
    var requestAction = this.state.obj.isGoing?'delete':'go';
    var requestURL = '/places/' + requestAction + '?placeID=' + this.props.placeID;
    $.getJSON(requestURL, function(data) {
      if (data && data.status === 'success') {
        var newState = this.state;
        newState.obj.going += newState.obj.isGoing?-1:1;
        newState.obj.isGoing = !newState.obj.isGoing;
        this.setState(newState);
      }
    }.bind(this));
  },
  render: function() {
    var btnClassName = 'btn btn-success btn-wrap';
    btnClassName += this.state.activeControls?'':'btn-disabled';
    var iconClassName = this.state.obj.isGoing?'fa fa-check':'fa fa-hand-o-right';
    var adverb = this.state.obj.going !== 1?'are':'is';
    return (
      <button type="button" className={btnClassName} onClick={this.onGoing}>
        <i className={iconClassName} aria-hidden="true"></i>&nbsp;
        {this.state.obj.going} {adverb} going.
      </button>
    );
  }
});

var PlaceBox = React.createClass({
  render: function() {
    var imgClasses = 'img-fluid img-rounded img-fsize m-x-auto';
    var imgAltText = 'Place photo';
    var imgSource = this.props.data.photo?this.props.data.photo:'/static/images/no-logo.svg';
    var isLoggedIn = document.querySelector('#isLoggedIn').value === 'yes';
    var goingComponent;
    if (isLoggedIn)
      goingComponent = <GoingBox placeID={this.props.data.id} />;
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
          {goingComponent}
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

function onFormSubmit(event) {
  if (event)
    event.preventDefault();
  $.ajax({
    type: 'POST',
    url: $('#search-form').attr('action'),
    data: $('#search-form').serialize(),
    dataType: 'json',
    success: onSearchEnd
  });
}

$(document).ready(function() {
  if ($('#keyword').attr('value') !== '')
    onFormSubmit();
  $('#search-form').submit(onFormSubmit);
});
