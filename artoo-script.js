/*
Ce script extrait la liste les évènements depuis la page du programme du Web2Day et 
la convertit en un fichier .csv compatible avec l'import Google Calendar

Fonctionnement :
 - installer le bookmarklet Artoo (sur http://medialab.github.io/artoo/)
 - aller sur https://web2day.co/programme/
 - lancer le bookmarklet Artoo
 - ouvrir la console JS et éxécuter le script en dessous. Cela va télécharger un fichier CSV
 - importer le fichier CSV (aide ici : https://support.google.com/calendar/answer/37118?hl=fr)
*/


artoo.injectScript('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.1/moment.js', function() {
  artoo.injectScript('//cdnjs.cloudflare.com/ajax/libs/URI.js/1.19.1/URI.js', function() {

    function getEventDetails(el) {

      var uri = new URI(el.attr('href'));
      var getParams = uri.search(true);
      var name = getParams.text.split('[Web2day]')[1];
      var location = getParams.location;
      var eventStartDate = moment(getParams.dates.split('/')[0]).format("DD/MM/YY")
      var eventStartTime = moment(getParams.dates.split('/')[0]).format("h:mm A")
      var eventEndDate = moment(getParams.dates.split('/')[1]).format("DD/MM/YY")
      var eventEndTime = moment(getParams.dates.split('/')[1]).format("h:mm A")
      var link = el.siblings( "a.event-link").attr('href');

      return {
        "Subject" : name,
        "Start Date" : eventStartDate,
        "Start Time" : eventStartTime,
        "End Date" : eventEndDate,
        "End Time" : eventEndTime,
        "Description" : '', //Todo, ajouter le speaker, la track et le lien
        "Location" : location,
        link: link
      }
    }

    artoo.scrape('div.event-gcal a.event-gcal', function($) {
        return getEventDetails($(this));
      }, artoo.saveCsv)

  });
});


