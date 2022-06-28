/******************************************************************************
 * OpenLP - Open Source Lyrics Projection                                      *
 * --------------------------------------------------------------------------- *
 * Copyright (c) 2008-2017 OpenLP Developers                                   *
 * --------------------------------------------------------------------------- *
 * This program is free software; you can redistribute it and/or modify it     *
 * under the terms of the GNU General Public License as published by the Free  *
 * Software Foundation; version 2 of the License.                              *
 *                                                                             *
 * This program is distributed in the hope that it will be useful, but WITHOUT *
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or       *
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for    *
 * more details.                                                               *
 *                                                                             *
 * You should have received a copy of the GNU General Public License along     *
 * with this program; if not, write to the Free Software Foundation, Inc., 59  *
 * Temple Place, Suite 330, Boston, MA 02111-1307 USA                          *
 ******************************************************************************/
window.OpenLP = {
  loadService: function (event) {
    $.getJSON(
      "/api/service/list",
      function (data, status) {
        for (idx in data.results.items) {
          idx = parseInt(idx, 10);
          if (data.results.items[idx]["selected"]) {
            OpenLP.currentPlugin = data.results.items[idx]["plugin"];
            console.log(OpenLP.currentPlugin);
            break;
          }
        }
        OpenLP.updateSlide();
      }
    );
  },
  loadSlides: function (event) {
    $.getJSON(
      "/api/controller/live/text",
      function (data, status) {
        OpenLP.currentSlides = data.results.slides;
        OpenLP.currentSlide = 0;
        $.each(data.results.slides, function(idx, slide) {
          if (slide["selected"]) {
            OpenLP.currentSlide = idx;
            }
        })
        OpenLP.loadService();
      }
    );
  },
  updateSlide: function() {
    // Show the current slide on top. Any trailing slides for the same verse
    // are shown too underneath in grey.
    // Then leave a blank line between following verses
    var slide = OpenLP.currentSlides[OpenLP.currentSlide];
    var text = "";

    if (OpenLP.currentlyShowing == "slides") {
      if (OpenLP.currentPlugin == "songs") {
        // use title if available
        if (slide["title"]) {
            text = slide["title"];
        } else {
            text = slide["text"];
        }
        // use thumbnail if available
        if (slide["img"]) {
            text += "<br /><img src='" + slide["img"].replace("/thumbnails/", "/thumbnails320x240/") + "'><br />";
            text = "";
        }
        // use slide_notes if available
        if (slide["slide_notes"]) {
            text += '<br />' + slide["slide_notes"];
        }
      }
    }
    // console.log(text);
    line_breaks = text.match(/\n/g);
    line_breaks = (line_breaks) ? line_breaks.length : 0;

    if (line_breaks >= 2) {
      regex = /\n(.*?(?:\n|$))/g;
      replace_string = "; $1";
      text = text.replace(regex, replace_string);
    }

    regex = /\n/g;
    replace_string = "<br />";
    text = text.replace(regex, replace_string);
    

    $("#currentslide").html(text);
    curslide = document.getElementById("currentslide");
    curslide.className = "";
    if (curslide.scrollHeight > curslide.clientHeight || curslide.scrollWidth > curslide.clientWidth) {
      curslide.className = "overflowing";
    }
    },
  pollServer: function () {
      
    $.getJSON(
      "/api/poll",
      function (data, status) {
        previouslyShowing = OpenLP.currentlyShowing;

        if(data.results.blank) {
          OpenLP.currentlyShowing = "blank";
        }
        else if(data.results.theme) {
          OpenLP.currentlyShowing = "theme";
        }
        else if(data.results.display) {
          OpenLP.currentlyShowing = "display";
        }
        else {
          OpenLP.currentlyShowing = "slides";
        }
        
        if (OpenLP.currentItem != data.results.item ||
            OpenLP.currentService != data.results.service) {
          OpenLP.currentItem = data.results.item;
          OpenLP.currentService = data.results.service;
          OpenLP.loadSlides();
          // also triggers loadService(), which triggers updateSlide()
        }
        else if (OpenLP.currentSlide != data.results.slide || previouslyShowing != OpenLP.currentlyShowing) {
          // OpenLP.currentItem = data.results.item;
          // OpenLP.currentService = data.results.service;
          OpenLP.loadSlides();
        }
    });
  }
}
$.ajaxSetup({ cache: false });
setInterval("OpenLP.pollServer();", 750);
OpenLP.pollServer();