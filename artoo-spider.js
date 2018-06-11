var trackMapping = {
  '276': {name: 'Startup & entrepreneurship', picto: '🚀'},
  '277': {name: 'Market, com & media', picto: '💵'},
  '280': {name: 'Society & FTW', picto: '👐'},
  '332': {name: 'Design', picto: '🖌'},
  '278': {name: 'Tech', picto: '💻'},
  '279': {name: 'Corporate', picto: '💼'},
}

var venueMapping = {
  Atlanbois: "🌳",
  Chapitalk: "🎪",
  'Maxi, Stereolux': "↔️",
  'Mediacampus, Forum': "🎓",
  "Micro, Stereolux": "🔬",
  Trempolino: "🚌"
};
function generateDesc(obj) {
  var venuePicto = venueMapping[obj.Location];
  if (trackMapping[obj._trackId]) {  
    var trackPicto = trackMapping[obj._trackId].picto;
    var trackName = trackMapping[obj._trackId].name;
    var trackInfo = trackPicto + '=' +trackName;
  } else {
    console.log('missing track');
    console.log(obj);
    trackInfo = '';
  }
  return (
    obj._titleCheck +
    "\n" +
    obj._eventDescription +
    "\n" +
    obj._speakers + 
    "\n" +
    "\n" +
    venuePicto + '=' + obj.Location +
    "\n" +
     trackInfo
  );
}

function generateTitle(obj) {
  // debugger;
  var venuePicto = venueMapping[obj.Location];
  var trackPicto = trackMapping[obj._trackId] ? trackMapping[obj._trackId].picto : ' ';
  return (
    venuePicto + '·' + trackPicto + '·' +obj._titleCheck
  );
}

artoo.injectScript(
  "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.10/lodash.js",
  function() {
    artoo.injectScript(
      "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.1/moment.js",
      function() {
        artoo.injectScript(
          "//cdnjs.cloudflare.com/ajax/libs/URI.js/1.19.1/URI.js",
          function() {
            var eventScraper = {
              iterator: "#main",
              data: {
                _titleCheck: { sel: ".page-title", method: "text" },
                _eventDescription: function($) {
                  const description = $(this).find('.editor')
                    .contents()
                    .filter((i, el)=>{
                      return  !$(el).hasClass('gform_wrapper') && !$(el).is('script')})
                    .text()
                    return description
                },
                _speakers : function($) {
                  var speakerList = '';
                  $(this).find( ".panel-speaker" ).each(function( index, el ) {
                    speakerList += $(el).find('.speaker-name').text() + ', ' + $(el).find('.speaker-job').text() + '\n';
                  });
                  return speakerList;

                },
              }
            };

            function getEventDetails(el) {
              var uri = new URI(el.attr("href"));
              var getParams = uri.search(true);
              var name = getParams.text.split("[Web2day]")[1];
              var location = getParams.location;
              var eventStartDate = moment(getParams.dates.split("/")[0]).format(
                "DD/MM/YY"
              );
              var eventStartTime = moment(getParams.dates.split("/")[0]).format(
                "h:mm A"
              );
              var eventEndDate = moment(getParams.dates.split("/")[1]).format(
                "DD/MM/YY"
              );
              var eventEndTime = moment(getParams.dates.split("/")[1]).format(
                "h:mm A"
              );
              var link = el.siblings("a.event-link").attr("href");
              var trackId = el.parent().parent().attr("data-univ");

              return {
                // Subject: name,
                "Start Date": eventStartDate,
                "Start Time": eventStartTime,
                "End Date": eventEndDate,
                "End Time": eventEndTime,
                // Description: "", //Todo, ajouter le speaker, la track et le lien
                Location: location,
                _link: link,
                _trackId: trackId
              };
            }

            var frontpage = artoo
              .scrape("div.event-gcal a.event-gcal", function($) {
                return getEventDetails($(this));
              })
              // .slice(0, 2);

            var allUrls = frontpage.map(value => value._link);
            artoo.ajaxSpider(allUrls, {
              // limit: 2,
              throttle: 10,
              scrape: eventScraper,
              concat: true,
              done: function(dataFromDetailPage) {
                const flatData = _.zipWith(
                  frontpage,
                  dataFromDetailPage,
                  function(a, b) {
                    return _.merge({}, a, b);
                  }
                ).map(row => {
                  return _.extend({}, row, { Description: generateDesc(row) , Subject : generateTitle(row)});
                });
                artoo.saveCsv(flatData, { filename: "web2day.csv" });
              }
            });
          }
        );
      }
    );
  }
);
