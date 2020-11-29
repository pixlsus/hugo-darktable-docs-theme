var lunrIndex;

// Initialize lunrjs using our generated index file
function initLunr() {
    var request = new XMLHttpRequest();
    request.open('GET', '{{ "index.json" | absURL }}', true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {

            pagesIndex = JSON.parse(request.responseText);
            console.log("index:", pagesIndex);

            // Set up lunrjs by declaring the fields we use
            // Also provide their boost level for the ranking
            lunrIndex = lunr(function () {
                this.field("title", {
                    boost: 20
                });
                this.field("tags", {
                    boost: 5
                });

                this.field("content", {
                    boost: 1
                });

                // ref is the result item identifier (I chose the page URL)
                this.ref("href");
                this.add({ field: "test", text: 'hello' });
                for (var i = 0; i < pagesIndex.length; ++i) {
                    this.add(pagesIndex[i]);
                }
            });
        } else {
            var err = textStatus + ", " + error;
            console.error("Error getting Hugo index flie:", err);
        }
    };

    request.send();
}

function search(query) {
    return lunrIndex.search(query).map(function (result) {
        return pagesIndex.filter(function (page) {
            return page.href === result.ref;
        })[0];
    });
}

function renderResults(results) {

   if (!results.length) {
      $("#search-results").hide();
      return;
   }

   // Only show the first twenty results
   $results = document.getElementById("search-results");

   results.slice(0, 20).forEach(function (result) {
      var p = document.createElement('p');
      var ahref = document.createElement('a');
      ahref.href = result.href;
      ahref.text = "» " + result.title;
      p.append(ahref);
      $results.appendChild(p);
   });

   $("#search-results").show();
}

$(document).ready(function() {
      $("#search-results").hide();
      $("#search-input").focus(function() {
            //load index file if it's not already been loaded
            if (! lunrIndex) { initLunr(); }
      });

      $("#search-input").keydown(function (e) {
         if(e.keyCode == 27)
         {
            $("#search-results").hide();
            $("#search-input").val("");
         }
      });

      $("#search-input").keyup(function (e) {
         //trigger a search if a search term longer than two characters has been entered
         $("#search-results").empty().hide();
         query = $("#search-input").val();
         if (query.length < 2) {
            return;
         }
         results = search(query + '~2');
         renderResults(results);
      });
});

